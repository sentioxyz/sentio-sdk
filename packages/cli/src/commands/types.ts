import { Command } from '@commander-js/extra-typings'

export type CommandOptionsType<T extends (...args: any[]) => Command<any, any, any>> = ReturnType<ReturnType<T>['opts']>
