process.on('unhandledRejection', (reason, p) => {
  if (reason?.message.startsWith('invalid ENS name (disallowed character: "*"')) {
    // ignore invalid ens error
  } else {
    throw reason
  }
})
