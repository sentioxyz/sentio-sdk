import { Command } from '@commander-js/extra-typings'

export type CommandOptionsType<T extends (...args: any[]) => Command> = ReturnType<ReturnType<T>['opts']>
