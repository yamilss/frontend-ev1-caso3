export const environment = {
  production: false,

  azure: {
    clientId: 'df1b7a79-8fd6-436b-8eca-c123b29f0457',
    tenantId: '3070fad0-b050-48d9-b664-a1cb8ddc6e0a',

    authority:
      'https://login.microsoftonline.com/3070fad0-b050-48d9-b664-a1cb8ddc6e0a',

    redirectUri: 'http://localhost:4200/',

    api: {
      clientId: 'ac800c78-64d2-4043-913d-b99264309ef6',

      scope:
        'api://ac800c78-64d2-4043-913d-b99264309ef6/access_as_user',

      // Apuntamos al BFF desplegado en la EC2
      url: 'http://34.200.47.179:8081/api',
    },
  },
};