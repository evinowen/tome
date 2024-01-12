import { vi } from 'vitest'

export default {
  ssl: {
    generate_private_key: vi.fn(() => ({ path: '/id_rsa' })),
    generate_public_key: vi.fn((target) => (({ path: `${target}.pub`, data: 'ssh-rsa 1234' })))
  }
}
