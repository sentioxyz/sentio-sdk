export function load(name: string): { module: any; name: string; path: string } | undefined {
  const req = eval('require')

  try {
    let path: string
    try {
      path = req.resolve(name, { paths: [process.cwd()] })
    } catch {
      path = req.resolve(name)
    }

    const module = { module: req(path), name, path }
    console.log('Load successfully: ', name)
    return module
  } catch (err) {
    if (err instanceof Error && err.message.startsWith(`Cannot find module '${name}'`)) {
      // this error is expected
      console.log("Couldn't load (expected): ", name)
      return undefined
    } else {
      throw err
    }
  }
}
