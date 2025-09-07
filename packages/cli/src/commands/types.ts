export type CommandOptionsType<T extends (...args: any[]) => any> = ReturnType<ReturnType<T>['opts']>
