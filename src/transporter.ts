import { ISettingsParam } from 'tslog';
import {} from 'mongodb';

// const tes: ISettingsParam<>;

// export type AvailableKeys = Omit<ILogObject, 'toJSON' | 'stack'>;

// export interface ITransporterOptions {
//   /** Name of measurement */
//   measurementName: string;
//   /** Destination port */
//   port: number;
//   /** Destination host name or IP address */
//   address: string;
//   /** Type of socket - udp4 or udp6 */
//   socketType: SocketType;
//   /** Minimum logging level to transport - default 'debug' */
//   minLevel?: TLogLevelName;
//   /** List of field keys - If no keys are provided, the default ones will be used */
//   fieldKeys?: Array<keyof AvailableKeys>;
//   /** List of tag keys - with string value only - If keys are not specified, default ones will be used */
//   tagKeys?: Array<keyof AvailableKeys>;
// }

// export interface ITransportProvider {
//   minLevel: TLogLevelName;
//   transportLogger: TTransportLogger<(message: ILogObject) => void>;
// }

/**
 * TODO
 * Add batching - default 5000msg, save after close if you can
 *
 */
export class Transporter {
  constructor(config: Record<string, unknown>) {}
  // /**
  //  * @returns Transport provider
  //  */
  // public getTransportProvider(): ITransportProvider {
  //   return {
  //     minLevel: this.options?.minLevel || 'debug',
  //     transportLogger: {
  //       debug: this.transport.bind(this),
  //       error: this.transport.bind(this),
  //       fatal: this.transport.bind(this),
  //       info: this.transport.bind(this),
  //       silly: this.transport.bind(this),
  //       trace: this.transport.bind(this),
  //       warn: this.transport.bind(this)
  //     }
  //   };
  // }
}
