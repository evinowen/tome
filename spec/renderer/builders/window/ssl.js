export default {
  ssl_generate_private_key: jest.fn((passphrase) => ({ path: '/id_rsa' })),
  ssl_generate_public_key: jest.fn((target, passphrase) => (({ path: `${target}.pub`, data: 'ssh-rsa 1234' })))
}
