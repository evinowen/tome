/*
 * Example:
 *
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
 * magna aliqua. Convallis posuere morbi leo urna molestie at. Feugiat nisl pretium fusce id velit ut tortor pretium.
 * Consectetur libero id faucibus nisl. A cras semper auctor neque vitae tempus quam pellentesque.
 *
 */
class ExampleClass {
  static StaticNumber = 42

  number = 12

  example_method (input_string, input_number) {
    console.log('example input string', input_string)
    console.log('example input number', input_string)

    const output = `example output ${input_string} ${input_number} ${this.number * this.number}`

    return output
  }

  example_static_method () {
    return ExampleClass.StaticNumber
  }
}

function example_function () {
  const example = new ExampleClass()

  example.example_method('example text', ExampleClass.StaticNumber)
}
