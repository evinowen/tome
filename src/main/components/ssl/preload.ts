import invoker from '../invoke'

const invoke = invoker('ssl')

export = {
  generate_public_key: invoke('generate-public-key'),
  generate_private_key: invoke('generate-private-key')
}