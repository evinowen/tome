export default {
  ssl_generate_public_key: jest.fn((target, passphrase) => (({ path: `${target}.pub`, data: 'ssh-rsa 1234' })))
}
