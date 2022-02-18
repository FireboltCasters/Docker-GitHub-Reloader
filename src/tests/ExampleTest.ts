import Example from '../Example';

test('Example Test', async () => {
  let result = Example.multiply(3, 4);
  console.log(result);
  expect(result).toBe(12);
});
