import { createSoapApiClient, SoapApiDescriptor } from './soap';

const ESXI_SOAP_API_DEFINITION = {
  SessionManager: {
    Login: {
      parameters: [{ name: 'userName' }, { name: 'password' }, { name: 'locale' }],
      types: (userName: string, password: string, locale: string) => ({
        _: '',
      }),
    },
    Logout: {
      parameters: [],
      types: () => ({ _: '' }),
    },
  },
  ViewManager: {
    CreateContainerView: {
      parameters: [{ name: 'container', type: 'Folder' }, { name: 'type' }, { name: 'recursive' }],
      types: (container: string, type: 'VirtualMachine', recursive: boolean) => ({ _: '' }),
    },
  },
  PropertyCollector: {
    RetrievePropertiesEx: {
      parameters: [{ name: 'specSet' }, { name: 'options' }],
      types: (specSet: string, options: '') => ({
        objects: [
          {
            obj: [{ _: '1234' }],
            propSet: [
              {
                name: ['name'],
                val: [{ _: 'value' }],
              },
            ],
          },
        ],
      }),
    },
  },
  VirtualMachine: {
    AcquireTicket: {
      parameters: [{ name: 'ticketType' }],
      types: (ticketType: 'webmks') => ({ ticket: [''] }),
    },
  },
} as const satisfies SoapApiDescriptor;

export async function acquireTicket(
  host: string,
  machineName: string,
  credentials: {
    username: string;
    password: string;
  },
) {
  const client = createSoapApiClient(host, ESXI_SOAP_API_DEFINITION);

  await client.SessionManager.getInstance('ha-sessionmgr').Login(
    credentials.username,
    credentials.password,
    'en-us',
  );
  const { _: containerViewSession } = await client.ViewManager.CreateContainerView(
    'ha-folder-root',
    'VirtualMachine',
    true,
  );

  try {
    const virtualMachinesResponse = await client.PropertyCollector.getInstance(
      'ha-property-collector',
    ).RetrievePropertiesEx(
      `
        <propSet xmlns="urn:vim25">
          <type xmlns="urn:vim25">VirtualMachine</type>
          <pathSet xmlns="urn:vim25">name</pathSet>
        </propSet>
        <objectSet xmlns="urn:vim25">
          <obj xmlns="urn:vim25" type="ContainerView">${containerViewSession}</obj>
          <skip xmlns="urn:vim25">true</skip>
          <selectSet xmlns="urn:vim25" xsi:type="TraversalSpec">
            <type xmlns="urn:vim25">ContainerView</type>
            <path xmlns="urn:vim25">view</path>
          </selectSet>
        </objectSet>
      `,
      '',
    );
    const machines = virtualMachinesResponse.objects.map((object) => ({
      reference: object.obj[0]._,
      name: object.propSet[0].val[0]._,
    }));

    const machineReference = machines
      .filter(({ name }) => name === machineName)
      .map(({ reference }) => reference)[0];

    if (!machineReference) {
      throw new Error(`Could not find machine '${machineName}' on ${host}`);
    }

    const {
      ticket: [ticket],
    } = await client.VirtualMachine.getInstance(machineReference).AcquireTicket('webmks');

    return ticket;
  } finally {
    await client.SessionManager.getInstance('ha-sessionmgr').Logout();
  }
}
