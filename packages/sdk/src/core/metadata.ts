export type Labels = { [key: string]: string }

export function normalizeName(name: string): string {
  return name.slice(0, 100).replace(/[^_\-a-zA-Z0-9]/g, '_')
}

export function normalizeKey(name: string): string {
  if (name === 'labels') {
    return 'labels_'
  }
  return normalizeName(name)
}

export function normalizeValue(name: string): string {
  return name.slice(0, 100)
}

export function normalizeLabels(labels: Labels): Labels {
  const normLabels: Labels = {}
  for (const key in labels) {
    normLabels[normalizeKey(key)] = normalizeValue(labels[key])
  }
  return normLabels
}

export class NamedResultDescriptor {
  name: string

  constructor(name: string) {
    this.name = normalizeName(name)
  }
}
