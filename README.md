# KyberWatch

KyberWatch is an API and a visualization tool which the users can use to query the historical price and volume trade data for the different tokens supported on Kyber Network. KyberWatch queries the volumetric data from the Kyber smart contract transactions for the token swap events. All the queried data is cached in a MySql database on an AWS instance for faster access.KyberWatch also allows to unlock their metamask account and check balances. 


### Prerequisites

Please install npm and node to build the project.

### API endpoints

/api/v1/kyber/currencies => list of supported currencies

/api/v1/kyber/currencies/:token/trades?start=&end= => list of trades for valid token supported by kyber within the 2 timestamps

/api/v1/kyber/currencies/:token/stats => 24 hour stats of Kyber supported token

/api/v1/kyber/currencies/:token/orders => few last orders of any kyber suppported currencies


## Usage

The project can be accessed [here](http://ethsg.herokuapp.com/)

## Authors

[Robin Thomas](https://github.com/robin-thomas)

[Siddhanjay Godre](https://github.com/siddhanjay)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

