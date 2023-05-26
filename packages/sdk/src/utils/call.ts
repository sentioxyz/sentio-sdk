/**
 * ignore eth call exception and return undefined if that happened
 * @param call
 */
export async function ethCallIgnoreException<Res>(call: () => Promise<Res>): Promise<Res | undefined> {
  try {
    return await call()
  } catch (err) {
    if (err.code === 'CALL_EXCEPTION') {
      console.log('eth call exception, return undefined', err)
      return undefined
    }
    throw err
  }
}
