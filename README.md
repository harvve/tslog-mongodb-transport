# tslog-mongodb-transport
The library allows logs to be stored in the mongodb timeseries collection.

<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#installation">Installation</a></li>
    <li>
      <a href="#usage">Usage</a>
      <ol>
        <li><a href="#settings">Settings</a></li>
      </ol>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>
<br>

## About The Project

This library provides a transporter that allows logs to be written to the timeseries collection in MongoDB.
The transporter simplifies configuration and ensures optimal writes to the database through log batching.
It provides flexible out-of-the-box configuration and the ability to customise parameters according to your needs.

### Installation

> **Requires: MongoDB >= v5.0, [ mongodb >= v4](https://www.npmjs.com/package/mongodb) driver and tslog >= v4**

```sh
npm i @harvve/tslog-mongodb-transport
```

## Usage
Attach transport to tslog instance.
```typescript
import { Logger } from 'tslog';
import { MongoClient } from 'mongodb';
import { Transporter } from '@harvve/tslog-mongodb-transport';

async function main(): Promise<void> {

  const client = await new MongoClient('mongodb://localhost:27017').connect();

  const mongodbTransporter = new Transporter({ db: client.db('logs_db') });

  const logger = new Logger({
    // on production set to true for better performance
    // https://tslog.js.org/#/?id=hidelogpositionforproduction-default-false
    hideLogPositionForProduction: false,
    argumentsArrayName: 'argumentsArray',  // default key name used by Transporter
    metaProperty: 'metadata', // default key name used by Transporter
    attachedTransports: [mongodbTransporter.transport.bind(mongodbTransporter)]
  });

  logger.info('Hello!');
}
```

_Check out working example --> [View Demo](https://github.com/harvve/tslog-mongodb-transport-demo)_


### Settings
All possible settings are defined in the `ITransporterOptions` interface and modern IDEs will provide auto-completion accordingly.

| Key | Type | Requirement | Description | Default |
|:---:|:---:|:---:|:---:|:---:|
|**db**| `Db` | *required* | class that represents a MongoDB Database (from `mongodb` lib) | --- |
|**collectionName**| `string` | *optional* | the name of collection in mongodb | `logs` |
|**granuality**| `seconds` `minutes` `hours` | *optional* | the timeseries data granularity | `seconds` |
|**argumentsArrayName**| `string` | *optional* | the logger arguments property key name | `argumentsArray` |
|**bucketSize**| `number` | *optional* | the size of the bucket with logs suitable for writing | `5000` |
|**updateInterval**| `number` | *optional* | the number of seconds between logs that must elapse to record an incomplete bucket | `1sec` |
|**logTTL**| `number` | *optional* | the lifetime (in seconds) of the document in the collection | `2592000sec (30days)` |
|**onErrorCallback(err: unknown)**| `function` | *optional* | callback function called when an error occurs | --- |
|**onBeforeWriteCallback(bucketLength: number)**| `function` | *optional* | callback function called before write (*`bucketLength - current length of items in bucket`*) | --- |
|**onAfterWriteCallback(insertResult: InsertManyResult<Document>, bucketLength: number)**| `function` | *optional* | callback function called after successful writing (*`insertResult - insert stats, bucketLength - current length of items in bucket`*) | --- |
|**onFinallyWriteCallback(bucketLength: number)**| `function` | *optional* | callback function called when recording has been completed (*`bucketLength - current length of items in bucket`*) | --- |

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.


<!-- CONTACT -->
## Contact

Project Link: [https://github.com/harvve/tslog-mongodb-transport](https://github.com/harvve/tslog-mongodb-transport)


<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
* [tslog docs](https://tslog.js.org/#/)
* [MongoDB Timeseries](https://www.mongodb.com/docs/manual/core/timeseries-collections/)


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/harvve/tslog-mongodb-transport.svg?style=for-the-badge
[contributors-url]: https://github.com/harvve/tslog-mongodb-transport/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/harvve/tslog-mongodb-transport.svg?style=for-the-badge
[forks-url]: https://github.com/harvve/tslog-mongodb-transport/network/members
[stars-shield]: https://img.shields.io/github/stars/harvve/tslog-mongodb-transport.svg?style=for-the-badge
[stars-url]: https://github.com/harvve/tslog-mongodb-transport/stargazers
[issues-shield]: https://img.shields.io/github/issues/harvve/tslog-mongodb-transport.svg?style=for-the-badge
[issues-url]: https://github.com/harvve/tslog-mongodb-transport/issues
[license-shield]: https://img.shields.io/github/license/harvve/tslog-mongodb-transport.svg?style=for-the-badge
[license-url]: https://github.com/harvve/tslog-mongodb-transport/blob/main/LICENSE.txt
