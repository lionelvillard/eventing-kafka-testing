import retry from 'retry-assert'

const timeout = 10000
const delay = 100

// Poll tries a condition func until it returns true, or the timeout
// is reached.
export async function poll(condition) {
  return retry().withTimeout(timeout).withRetryDelay(delay).fn(condition).untilTruthy()
}
