const base36_upper = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const base36_lower = '0123456789abcdefghijklmnopqrstuvwxyz'

module.exports = (expect) => ({
  expect_call_parameters_to_return: (expect) => (callable, parameters, result) => {
    expect(callable).toHaveBeenCalled()

    const mock_call = callable.mock.calls.shift()
    for (const index in parameters) {
      const mock_parameter = mock_call[index]
      expect(mock_parameter).toEqual(parameters[index])
    }

    const mock_result = callable.mock.results.shift()
    expect(mock_result.value).toEqual(result)
  },
  random_string: (length = 16, upper = true) => {
    let result = ''
    const base36 = upper ? base36_upper : base36_lower
    for (let i = 0; i < length; i++) {
      result += base36.charAt(Math.floor(Math.random() * base36.length))
    }

    return result
  }
})
