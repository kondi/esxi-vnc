import xml2js from 'xml2js';

type MapStringsToAllowedMethodParameter<Array> = {
  [I in keyof Array]: Array[I] extends string ? string | number | boolean : never;
};

type SoapMethodParametersDescriptor = readonly {
  name: string;
  type?: string;
}[];

type SoapResponseDescriptor = object;

type SoapMethodDescriptor<Parameters extends SoapMethodParametersDescriptor> = {
  parameters: Parameters;
  types: (...args: MapStringsToAllowedMethodParameter<Parameters>) => SoapResponseDescriptor;
};

export type SoapApiDescriptor = {
  [serviceType: string]: {
    [name: string]: SoapMethodDescriptor<SoapMethodParametersDescriptor>;
  };
};

type WrappedSoapResponse<MethodName extends string, R> = {
  'soapenv:Envelope': {
    'soapenv:Body': [
      Record<
        `${MethodName}Response`,
        [
          {
            returnval?: [R];
          },
        ]
      >,
    ];
  };
};

type SoapResponse<D extends SoapResponseDescriptor> = D;

type SoapServiceInstance<
  D extends SoapApiDescriptor,
  ServiceType extends Extract<keyof D, string>,
> = {
  [MethodName in Extract<
    keyof D[ServiceType],
    string
    // We have to infer ParameterNames to make sure TypeScript actually validates it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  >]: D[ServiceType][MethodName] extends SoapMethodDescriptor<infer ParameterNames>
    ? (
        ...args: Parameters<D[ServiceType][MethodName]['types']>
      ) => Promise<SoapResponse<ReturnType<D[ServiceType][MethodName]['types']>>>
    : `Invalid definition for ${ServiceType}.${MethodName} method.`;
};

type SoapApiClient<D extends SoapApiDescriptor> = {
  [ServiceType in Extract<keyof D, string>]: SoapServiceInstance<D, ServiceType> & {
    getInstance(name: string): SoapServiceInstance<D, ServiceType>;
  };
};

export function createSoapApiClient<const D extends SoapApiDescriptor>(
  host: string,
  apiDescriptor: D,
): SoapApiClient<D> {
  const xmlParser = new xml2js.Parser();
  const serviceTypes = typedKeys(apiDescriptor);
  const services: Partial<SoapApiClient<D>> = {};
  let lastCookies = '';
  for (const serviceType of serviceTypes) {
    const serviceDescriptor = apiDescriptor[serviceType];
    services[serviceType] = Object.assign(
      createServiceInstance(serviceType, serviceDescriptor, serviceType),
      {
        getInstance: (thisInstance: string) => {
          return createServiceInstance(thisInstance, serviceDescriptor, serviceType);
        },
      },
    );
  }
  return services as SoapApiClient<D>;

  function createServiceInstance<ServiceType extends Extract<keyof D, string>>(
    thisInstance: string,
    serviceDescriptor: D[Extract<keyof D, string>],
    serviceType: ServiceType,
  ) {
    const methodNames = typedKeys(serviceDescriptor);
    const service: Partial<SoapApiClient<D>[keyof SoapApiClient<D>]> = {};
    for (const methodName of methodNames) {
      service[methodName] = (async (...args: unknown[]) => {
        const response = await fetch(`https://${host}/sdk`, {
          method: 'POST',
          headers: {
            cookie: lastCookies,
            SOAPAction: 'urn:vim25/7.0.2.0',
            'Content-Type': 'text/xml',
          },
          body: `
            <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
              <Body xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                <${methodName} xmlns="urn:vim25">
                    <_this xmlns="urn:vim25" type="${serviceType}">${thisInstance}</_this>
                    ${serviceDescriptor[methodName].parameters
                      .map((parameterDescriptor, parameterIndex) => {
                        return `<${parameterDescriptor.name} xmlns="urn:vim25"${
                          parameterDescriptor.type ? ` type="${parameterDescriptor.type}"` : ''
                        }>${String(args[parameterIndex])}</${parameterDescriptor.name}>`;
                      })
                      .join('\n')}
                </${methodName}>
              </Body>
            </Envelope>
          `,
        });
        const responseCookies = response.headers.getSetCookie().map((entry) => entry.split(';')[0]);
        if (responseCookies.length) {
          lastCookies = responseCookies.join(';');
        }
        const wrappedResponse = (await xmlParser.parseStringPromise(
          await response.text(),
        )) as WrappedSoapResponse<typeof methodName, unknown>;

        return wrappedResponse['soapenv:Envelope']['soapenv:Body'][0][`${methodName}Response`][0]
          .returnval?.[0];
      }) as unknown as (typeof service)[typeof methodName];
    }
    return service as SoapServiceInstance<D, ServiceType>;
  }
}

function typedKeys<T extends object>(object: T) {
  return Object.keys(object) as Extract<keyof T, string>[];
}
