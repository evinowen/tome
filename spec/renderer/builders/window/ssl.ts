export default {
  ssl: {
    generate_private_key: jest.fn(() => ({ path: '/id_rsa' })),
    generate_public_key: jest.fn((target) => (({ path: `${target}.pub`, data: 'ssh-rsa 1234' })))
  }
}
