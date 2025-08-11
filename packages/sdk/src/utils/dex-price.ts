import { getEACAggregatorProxyContract } from '../eth/builtin/eacaggregatorproxy.js'
import { BlockTag } from 'ethers/providers'
import { scaleDown } from '../core/big-decimal.js'
import { EthChainId } from '@sentio/chain'

type OralceRecord = {
  Pair: string
  Asset: string
  Type: string
  Address: string
}

export enum PriceUnit {
  USD = 0,
  ETH = 1,
  BTC = 2
}

export interface DexPriceResult {
  price?: number
  error?: string
}

const ETHEREUM_ORACLES: OralceRecord[] = [
  { Pair: '1INCH / ETH', Asset: '1inch', Type: 'Crypto', Address: '0x72AFAECF99C9d9C8215fF44C77B94B99C28741e8' },
  { Pair: '1INCH / USD', Asset: '1inch', Type: 'Crypto', Address: '0xc929ad75B72593967DE83E7F7Cda0493458261D9' },
  { Pair: 'AAPL / USD', Asset: 'Apple', Type: 'Equities', Address: '0x139C8512Cde1778e9b9a8e721ce1aEbd4dD43587' },
  { Pair: 'AAVE / ETH', Asset: 'Aave', Type: 'Crypto', Address: '0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012' },
  { Pair: 'AAVE / USD', Asset: 'Aave', Type: 'Crypto', Address: '0x547a514d5e3769680Ce22B2361c10Ea13619e8a9' },
  { Pair: 'ADA / USD', Asset: 'Cardano', Type: 'Crypto', Address: '0xAE48c91dF1fE419994FFDa27da09D5aC69c30f55' },
  { Pair: 'ADX / USD', Asset: 'Adex', Type: 'Crypto', Address: '0x231e764B44b2C1b7Ca171fa8021A24ed520Cde10' },
  {
    Pair: 'ALBT / USD',
    Asset: 'Aliiance Block',
    Type: 'Crypto',
    Address: '0x057e52Fb830318E096CD96F369f0DB4B196fBfa7'
  },
  { Pair: 'ALCX / ETH', Asset: 'Alchemix', Type: 'Crypto', Address: '0x194a9AaF2e0b67c35915cD01101585A33Fe25CAa' },
  { Pair: 'ALCX / USD', Asset: 'Alchemix', Type: 'Crypto', Address: '0xc355e4C0B3ff4Ed0B49EaACD55FE29B311f42976' },
  { Pair: 'ALGO / USD', Asset: 'Algorand', Type: 'Crypto', Address: '0xC33c0400dBD8043c5bE09512501Ce59253D499cE' },
  {
    Pair: 'ALPHA / ETH',
    Asset: 'Alpha Finance',
    Type: 'Crypto',
    Address: '0x89c7926c7c15fD5BFDB1edcFf7E7fC8283B578F6'
  },
  { Pair: 'AMP / USD', Asset: 'Amp', Type: 'Crypto', Address: '0x8797ABc4641dE76342b8acE9C63e3301DC35e3d8' },
  { Pair: 'AMPL / ETH', Asset: 'Ampleforth', Type: 'Crypto', Address: '0x492575FDD11a0fCf2C6C719867890a7648d526eB' },
  { Pair: 'AMPL / USD', Asset: 'Ampleforth', Type: 'Crypto', Address: '0xe20CA8D7546932360e37E9D72c1a47334af57706' },
  { Pair: 'AMZN / USD', Asset: 'Amazon', Type: 'Equities', Address: '0x8994115d287207144236c13Be5E2bDbf6357D9Fd' },
  { Pair: 'ANKR / USD', Asset: 'Ankr', Type: 'Crypto', Address: '0x7eed379bf00005CfeD29feD4009669dE9Bcc21ce' },
  { Pair: 'ANT / ETH', Asset: 'Aragon', Type: 'Crypto', Address: '0x8f83670260F8f7708143b836a2a6F11eF0aBac01' },
  { Pair: 'APE / ETH', Asset: 'APECoin', Type: 'Crypto', Address: '0xc7de7f4d4C9c991fF62a07D18b3E31e349833A18' },
  { Pair: 'APE / USD', Asset: 'APECoin', Type: 'Crypto', Address: '0xD10aBbC76679a20055E167BB80A24ac851b37056' },
  { Pair: 'ARPA / USD', Asset: 'ARPA Chain', Type: 'Crypto', Address: '0xc40ec815A2f8eb9912BD688d3bdE6B6D50A37ff2' },
  { Pair: 'ATOM / ETH', Asset: 'Cosmos', Type: 'Crypto', Address: '0x15c8eA24Ba2d36671Fa22aD4Cff0a8eafe144352' },
  { Pair: 'ATOM / USD', Asset: 'Cosmos', Type: 'Crypto', Address: '0xDC4BDB458C6361093069Ca2aD30D74cc152EdC75' },
  {
    Pair: 'AUD / USD',
    Asset: 'Australian Dollar',
    Type: 'Forex',
    Address: '0x77F9710E7d0A19669A13c055F62cd80d313dF022'
  },
  { Pair: 'AVAX / USD', Asset: 'Avalanche', Type: 'Crypto', Address: '0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7' },
  { Pair: 'AXS / ETH', Asset: 'Axie Infinity', Type: 'Crypto', Address: '0x8B4fC5b68cD50eAc1dD33f695901624a4a1A0A8b' },
  { Pair: 'BADGER / ETH', Asset: 'Badger DAO', Type: 'Crypto', Address: '0x58921Ac140522867bf50b9E009599Da0CA4A2379' },
  { Pair: 'BADGER / USD', Asset: 'Badger DAO', Type: 'Crypto', Address: '0x66a47b7206130e6FF64854EF0E1EDfa237E65339' },
  { Pair: 'BAL / ETH', Asset: 'Balancer', Type: 'Crypto', Address: '0xC1438AA3823A6Ba0C159CfA8D98dF5A994bA120b' },
  { Pair: 'BAL / USD', Asset: 'Balancer', Type: 'Crypto', Address: '0xdF2917806E30300537aEB49A7663062F4d1F2b5F' },
  { Pair: 'BAND / ETH', Asset: 'Band Protocol', Type: 'Crypto', Address: '0x0BDb051e10c9718d1C29efbad442E88D38958274' },
  { Pair: 'BAND / USD', Asset: 'Band Protocol', Type: 'Crypto', Address: '0x919C77ACc7373D000b329c1276C76586ed2Dd19F' },
  {
    Pair: 'BAT / ETH',
    Asset: 'Basic Attention Token',
    Type: 'Crypto',
    Address: '0x0d16d4528239e9ee52fa531af613AcdB23D88c94'
  },
  {
    Pair: 'BAT / USD',
    Asset: 'Basic Attention Token',
    Type: 'Crypto',
    Address: '0x9441D7556e7820B5ca42082cfa99487D56AcA958'
  },
  { Pair: 'BCH / USD', Asset: 'Bitcoin Cash', Type: 'Crypto', Address: '0x9F0F69428F923D6c95B781F89E165C9b2df9789D' },
  { Pair: 'BETA / ETH', Asset: 'Beta Finance', Type: 'Crypto', Address: '0x8eb7bAe1eCd3dcf87159Eb5BACe78209722F795B' },
  { Pair: 'BIT / USD', Asset: 'BitDAO', Type: 'Crypto', Address: '0x7b33EbfA52F215a30FaD5a71b3FeE57a4831f1F0' },
  { Pair: 'BNB / ETH', Asset: 'BNB', Type: 'Crypto', Address: '0xc546d2d06144F9DD42815b8bA46Ee7B8FcAFa4a2' },
  { Pair: 'BNB / USD', Asset: 'BNB', Type: 'Crypto', Address: '0x14e613AC84a31f709eadbdF89C6CC390fDc9540A' },
  { Pair: 'BNT / ETH', Asset: 'Bancor', Type: 'Crypto', Address: '0xCf61d1841B178fe82C8895fe60c2EDDa08314416' },
  { Pair: 'BNT / USD', Asset: 'Bancor', Type: 'Crypto', Address: '0x1E6cF0D433de4FE882A437ABC654F58E1e78548c' },
  { Pair: 'BOND / ETH', Asset: 'Barnbridge', Type: 'Crypto', Address: '0xdd22A54e05410D8d1007c38b5c7A3eD74b855281' },
  { Pair: 'BRL / USD', Asset: 'Brazilian Real', Type: 'Forex', Address: '0x971E8F1B779A5F1C36e1cd7ef44Ba1Cc2F5EeE0f' },
  { Pair: 'BTC / ETH', Asset: 'Bitcoin', Type: 'Crypto', Address: '0xdeb288F737066589598e9214E782fa5A8eD689e8' },
  { Pair: 'BTC / USD', Asset: 'Bitcoin', Type: 'Crypto', Address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c' },
  { Pair: 'BUSD / ETH', Asset: 'Binance USD', Type: 'Crypto', Address: '0x614715d2Af89E6EC99A233818275142cE88d1Cfd' },
  { Pair: 'BUSD / USD', Asset: 'Binance USD', Type: 'Crypto', Address: '0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A' },
  { Pair: 'C98 / USD', Asset: 'C98', Type: 'Crypto', Address: '0xE95CDc33E1F5BfE7eB26f45E29C6C9032B97db7F' },
  { Pair: 'CAD / USD', Asset: 'Canadian Dollar', Type: 'Forex', Address: '0xa34317DB73e77d453b1B8d04550c44D10e981C8e' },
  { Pair: 'CAKE / USD', Asset: 'Pancakeswap', Type: 'Crypto', Address: '0xEb0adf5C06861d6c07174288ce4D0a8128164003' },
  { Pair: 'CEL / ETH', Asset: 'Celsius', Type: 'Crypto', Address: '0x75FbD83b4bd51dEe765b2a01e8D3aa1B020F9d33' },
  { Pair: 'CELO / ETH', Asset: 'Celo', Type: 'Crypto', Address: '0x9ae96129ed8FE0C707D6eeBa7b90bB1e139e543e' },
  { Pair: 'CHF / USD', Asset: 'Swiss Franc', Type: 'Forex', Address: '0x449d117117838fFA61263B61dA6301AA2a88B13A' },
  { Pair: 'CNY / USD', Asset: 'Chinese Yuan', Type: 'Forex', Address: '0xeF8A4aF35cd47424672E3C590aBD37FBB7A7759a' },
  { Pair: 'COMP / ETH', Asset: 'Compound', Type: 'Crypto', Address: '0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699' },
  { Pair: 'COMP / USD', Asset: 'Compound', Type: 'Crypto', Address: '0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5' },
  {
    Pair: 'CREAM / ETH',
    Asset: 'CREAM Finance',
    Type: 'Crypto',
    Address: '0x82597CFE6af8baad7c0d441AA82cbC3b51759607'
  },
  { Pair: 'CRO / ETH', Asset: 'Cronos', Type: 'Crypto', Address: '0xcA696a9Eb93b81ADFE6435759A29aB4cf2991A96' },
  { Pair: 'CRO / USD', Asset: 'Cronos', Type: 'Crypto', Address: '0x00Cb80Cf097D9aA9A3779ad8EE7cF98437eaE050' },
  { Pair: 'CRV / ETH', Asset: 'Curve DAO', Type: 'Crypto', Address: '0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e' },
  { Pair: 'CRV / USD', Asset: 'Curve DAO', Type: 'Crypto', Address: '0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f' },
  {
    Pair: 'CSPR / USD',
    Asset: 'Casper Network',
    Type: 'Crypto',
    Address: '0x9e37a8Ee3bFa8eD6783Db031Dc458d200b226074'
  },
  { Pair: 'CTSI / ETH', Asset: 'Cartesi', Type: 'Crypto', Address: '0x0a1d1b9847d602e789be38B802246161FFA24930' },
  { Pair: 'CVX / ETH', Asset: 'Convex Finance', Type: 'Crypto', Address: '0xC9CbF687f43176B302F03f5e58470b77D07c61c6' },
  { Pair: 'CVX / USD', Asset: 'Convex Finance', Type: 'Crypto', Address: '0xd962fC30A72A84cE50161031391756Bf2876Af5D' },
  { Pair: 'DAI / ETH', Asset: 'DAI', Type: 'Crypto', Address: '0x773616E4d11A78F511299002da57A0a94577F1f4' },
  { Pair: 'DAI / USD', Asset: 'DAI', Type: 'Crypto', Address: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9' },
  { Pair: 'DASH / USD', Asset: 'Dash', Type: 'Crypto', Address: '0xFb0cADFEa136E9E343cfb55B863a6Df8348ab912' },
  { Pair: 'DIA / USD', Asset: 'DIA', Type: 'Equities', Address: '0xeE636E1f7A0A846EEc2385E729CeA7D1b339D40D' },
  { Pair: 'DODO / USD', Asset: 'Dodo', Type: 'Crypto', Address: '0x9613A51Ad59EE375e6D8fa12eeef0281f1448739' },
  { Pair: 'DOGE / USD', Asset: 'Dogecoin', Type: 'Crypto', Address: '0x2465CefD3b488BE410b941b1d4b2767088e2A028' },
  { Pair: 'DOT / USD', Asset: 'Polkadot', Type: 'Crypto', Address: '0x1C07AFb8E2B827c5A4739C6d59Ae3A5035f28734' },
  {
    Pair: 'DPI / USD',
    Asset: 'DefiPulse Index',
    Type: 'Crypto',
    Address: '0xD2A593BF7594aCE1faD597adb697b5645d5edDB2'
  },
  { Pair: 'DYDX / USD', Asset: 'dYdX', Type: 'Crypto', Address: '0x478909D4D798f3a1F11fFB25E4920C959B4aDe0b' },
  { Pair: 'ENJ / ETH', Asset: 'Enjin Coin', Type: 'Crypto', Address: '0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B' },
  { Pair: 'ENJ / USD', Asset: 'Enjin Coin', Type: 'Crypto', Address: '0x23905C55dC11D609D5d11Dc604905779545De9a7' },
  {
    Pair: 'ENS / USD',
    Asset: 'Ethereum Name Service',
    Type: 'Crypto',
    Address: '0x5C00128d4d1c2F4f652C267d7bcdD7aC99C16E16'
  },
  { Pair: 'EOS / USD', Asset: 'EOS', Type: 'Crypto', Address: '0x10a43289895eAff840E8d45995BBa89f9115ECEe' },
  {
    Pair: 'ERN / USD',
    Asset: 'Ethernity Chain',
    Type: 'Crypto',
    Address: '0x0a87e12689374A4EF49729582B474a1013cceBf8'
  },
  {
    Pair: 'ETC / USD',
    Asset: 'Ethereum Classic',
    Type: 'Crypto',
    Address: '0xaEA2808407B7319A31A383B6F8B60f04BCa23cE2'
  },
  { Pair: 'ETH / BTC', Asset: 'Ethereum', Type: 'Crypto', Address: '0xAc559F25B1619171CbC396a50854A3240b6A4e99' },
  { Pair: 'ETH / USD', Asset: 'Ethereum', Type: 'Crypto', Address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' },
  { Pair: 'EUR / USD', Asset: 'Euro', Type: 'Forex', Address: '0xb49f677943BC038e9857d61E7d053CaA2C1734C1' },
  { Pair: 'EURT / USD', Asset: 'Tether Euro', Type: 'Crypto', Address: '0x01D391A48f4F7339aC64CA2c83a07C22F95F587a' },
  {
    Pair: 'FARM / ETH',
    Asset: 'Harvest Finance',
    Type: 'Crypto',
    Address: '0x611E0d2709416E002A3f38085e4e1cf77c015921'
  },
  { Pair: 'FB / USD', Asset: 'Meta', Type: 'Equities', Address: '0xCe1051646393087e706288C1B57Fd26446657A7f' },
  { Pair: 'FEI / ETH', Asset: 'FEI Protocol', Type: 'Crypto', Address: '0x7F0D2c2838c6AC24443d13e23d99490017bDe370' },
  { Pair: 'FEI / USD', Asset: 'FEI Protocol', Type: 'Crypto', Address: '0x31e0a88fecB6eC0a411DBe0e9E76391498296EE9' },
  { Pair: 'FIL / ETH', Asset: 'Filecoin', Type: 'Crypto', Address: '0x0606Be69451B1C9861Ac6b3626b99093b713E801' },
  { Pair: 'FLOW / USD', Asset: 'Flow', Type: 'Crypto', Address: '0xD9BdD9f5ffa7d89c846A5E3231a093AE4b3469D2' },
  { Pair: 'FOR / USD', Asset: 'ForTube', Type: 'Crypto', Address: '0x456834f736094Fb0AAD40a9BBc9D4a0f37818A54' },
  {
    Pair: 'FORTH / USD',
    Asset: 'Ampleforth Governance',
    Type: 'Crypto',
    Address: '0x7D77Fd73E468baECe26852776BeaF073CDc55fA0'
  },
  { Pair: 'FOX / USD', Asset: 'Shapeshift FOX', Type: 'Crypto', Address: '0xccA02FFEFAcE21325befD6616cB4Ba5fCB047480' },
  { Pair: 'FRAX / ETH', Asset: 'FRAX', Type: 'Crypto', Address: '0x14d04Fff8D21bd62987a5cE9ce543d2F1edF5D3E' },
  { Pair: 'FRAX / USD', Asset: 'FRAX', Type: 'Crypto', Address: '0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD' },
  { Pair: 'FTM / ETH', Asset: 'Fantom', Type: 'Crypto', Address: '0x2DE7E4a9488488e0058B95854CC2f7955B35dC9b' },
  { Pair: 'FTT / ETH', Asset: 'FTX Token', Type: 'Crypto', Address: '0xF0985f7E2CaBFf22CecC5a71282a89582c382EFE' },
  { Pair: 'FTT / USD', Asset: 'FTX Token', Type: 'Crypto', Address: '0x84e3946C6df27b453315a1B38e4dECEF23d9F16F' },
  { Pair: 'FXS / USD', Asset: 'Frax Share', Type: 'Crypto', Address: '0x6Ebc52C8C1089be9eB3945C4350B68B8E4C2233f' },
  { Pair: 'GBP / USD', Asset: 'Pound Sterling', Type: 'Forex', Address: '0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5' },
  { Pair: 'GHST / ETH', Asset: 'Aavegotchi', Type: 'Crypto', Address: '0x5877385f9F51B46Bbd93F24AD278D681E1Fd2A93' },
  { Pair: 'GLM / USD', Asset: 'Golen', Type: 'Crypto', Address: '0x83441C3A10F4D05de6e0f2E849A850Ccf27E6fa7' },
  { Pair: 'GNO / ETH', Asset: 'Gnosis', Type: 'Crypto', Address: '0xA614953dF476577E90dcf4e3428960e221EA4727' },
  { Pair: 'GOOGL / USD', Asset: 'Alphabet', Type: 'Equities', Address: '0x36D39936BeA501755921beB5A382a88179070219' },
  { Pair: 'GRT / ETH', Asset: 'The Graph', Type: 'Crypto', Address: '0x17D054eCac33D91F7340645341eFB5DE9009F1C1' },
  { Pair: 'GRT / USD', Asset: 'The Graph', Type: 'Crypto', Address: '0x86cF33a451dE9dc61a2862FD94FF4ad4Bd65A5d2' },
  { Pair: 'GTC / ETH', Asset: 'GitCoin', Type: 'Crypto', Address: '0x0e773A17a01E2c92F5d4c53435397E2bd48e215F' },
  { Pair: 'GUSD / ETH', Asset: 'Gemini Dollar', Type: 'Crypto', Address: '0x96d15851CBac05aEe4EFD9eA3a3DD9BDEeC9fC28' },
  { Pair: 'GUSD / USD', Asset: 'Gemini Dollar', Type: 'Crypto', Address: '0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc' },
  {
    Pair: 'HBAR / USD',
    Asset: 'Hedera Hashgraph',
    Type: 'Crypto',
    Address: '0x38C5ae3ee324ee027D88c5117ee58d07c9b4699b'
  },
  { Pair: 'HIGH / USD', Asset: 'Highstreet', Type: 'Crypto', Address: '0xe2F95bC12FE8a3C35684Be7586C39fD7c0E5b403' },
  { Pair: 'HT / USD', Asset: 'Huobi Token', Type: 'Crypto', Address: '0xE1329B3f6513912CAf589659777b66011AEE5880' },
  { Pair: 'HUSD / ETH', Asset: 'HUSD', Type: 'Crypto', Address: '0x1B61BAD1495161bCb6C03DDB0E41622c0270bB1A' },
  { Pair: 'ILV / ETH', Asset: 'Illuvium', Type: 'Crypto', Address: '0xf600984CCa37cd562E74E3EE514289e3613ce8E4' },
  { Pair: 'IMX / USD', Asset: 'Immutable X', Type: 'Crypto', Address: '0xBAEbEFc1D023c0feCcc047Bff42E75F15Ff213E6' },
  {
    Pair: 'INJ / USD',
    Asset: 'Injective Protocol',
    Type: 'Crypto',
    Address: '0xaE2EbE3c4D20cE13cE47cbb49b6d7ee631Cd816e'
  },
  { Pair: 'INR / USD', Asset: 'Indian Rupee', Type: 'Forex', Address: '0x605D5c2fBCeDb217D7987FC0951B5753069bC360' },
  { Pair: 'IOST / USD', Asset: 'IOST', Type: 'Crypto', Address: '0xd0935838935349401c73a06FCde9d63f719e84E5' },
  { Pair: 'IOTX / USD', Asset: 'IoTeX', Type: 'Crypto', Address: '0x96c45535d235148Dc3ABA1E48A6E3cFB3510f4E2' },
  { Pair: 'JPY / USD', Asset: 'Japanese Yen', Type: 'Forex', Address: '0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3' },
  {
    Pair: 'KNC / ETH',
    Asset: 'Kyber Network Crystal',
    Type: 'Crypto',
    Address: '0x656c0544eF4C98A6a98491833A89204Abb045d6b'
  },
  { Pair: 'KNC / USD', Asset: 'Kyber Network', Type: 'Crypto', Address: '0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc' },
  { Pair: 'KP3R / ETH', Asset: 'Keep3r v1', Type: 'Crypto', Address: '0xe7015CCb7E5F788B8c1010FC22343473EaaC3741' },
  { Pair: 'KRW / USD', Asset: 'Korean Won', Type: 'Forex', Address: '0x01435677FB11763550905594A16B645847C1d0F3' },
  { Pair: 'KSM / USD', Asset: 'Kusama', Type: 'Crypto', Address: '0x06E4164E24E72B879D93360D1B9fA05838A62EB5' },
  { Pair: 'LDO / ETH', Asset: 'Lido DAO', Type: 'Crypto', Address: '0x4e844125952D32AcdF339BE976c98E22F6F318dB' },
  { Pair: 'LINK / ETH', Asset: 'Chainlink', Type: 'Crypto', Address: '0xDC530D9457755926550b59e8ECcdaE7624181557' },
  { Pair: 'LINK / USD', Asset: 'Chainlink', Type: 'Crypto', Address: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c' },
  { Pair: 'LON / ETH', Asset: 'Tokenlon', Type: 'Crypto', Address: '0x13A8F2cC27ccC2761ca1b21d2F3E762445f201CE' },
  { Pair: 'LRC / ETH', Asset: 'Loopring', Type: 'Crypto', Address: '0x160AC928A16C93eD4895C2De6f81ECcE9a7eB7b4' },
  { Pair: 'LTC / USD', Asset: 'Litecoin', Type: 'Crypto', Address: '0x6AF09DF7563C363B5763b9102712EbeD3b9e859B' },
  { Pair: 'LUSD / USD', Asset: 'Liquity USD', Type: 'Crypto', Address: '0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0' },
  { Pair: 'MANA / ETH', Asset: 'Decentraland', Type: 'Crypto', Address: '0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9' },
  { Pair: 'MANA / USD', Asset: 'Decentraland', Type: 'Crypto', Address: '0x56a4857acbcfe3a66965c251628B1c9f1c408C19' },
  {
    Pair: 'MATIC / USD',
    Asset: 'Polygon (MATIC)',
    Type: 'Crypto',
    Address: '0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676'
  },
  {
    Pair: 'MIM / USD',
    Asset: 'Magic Internet Money',
    Type: 'Crypto',
    Address: '0x7A364e8770418566e3eb2001A96116E6138Eb32F'
  },
  { Pair: 'MKR / ETH', Asset: 'Maker', Type: 'Crypto', Address: '0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2' },
  { Pair: 'MKR / USD', Asset: 'Maker', Type: 'Crypto', Address: '0xec1D1B3b0443256cc3860e24a46F108e699484Aa' },
  { Pair: 'MLN / ETH', Asset: 'Melon', Type: 'Crypto', Address: '0xDaeA8386611A157B08829ED4997A8A62B557014C' },
  { Pair: 'MSFT / USD', Asset: 'Microsoft', Type: 'Equities', Address: '0x021Fb44bfeafA0999C7b07C4791cf4B859C3b431' },
  { Pair: 'NEAR / USD', Asset: 'NEAR Protocol', Type: 'Crypto', Address: '0xC12A6d1D827e23318266Ef16Ba6F397F2F91dA9b' },
  { Pair: 'NFLX / USD', Asset: 'Netflix', Type: 'Equities', Address: '0x67C2e69c5272B94AF3C90683a9947C39Dc605ddE' },
  { Pair: 'NMR / ETH', Asset: 'Numeraire', Type: 'Crypto', Address: '0x9cB2A01A7E64992d32A34db7cEea4c919C391f6A' },
  { Pair: 'NMR / USD', Asset: 'Numeraire', Type: 'Crypto', Address: '0xcC445B35b3636bC7cC7051f4769D8982ED0d449A' },
  {
    Pair: 'NZD / USD',
    Asset: 'New Zealand Dollar',
    Type: 'Forex',
    Address: '0x3977CFc9e4f29C184D4675f4EB8e0013236e5f3e'
  },
  {
    Pair: 'OCEAN / ETH',
    Asset: 'Ocean Protocol',
    Type: 'Crypto',
    Address: '0x9b0FC4bb9981e5333689d69BdBF66351B9861E62'
  },
  {
    Pair: 'OGN / ETH',
    Asset: 'Origin Protocol',
    Type: 'Crypto',
    Address: '0x2c881B6f3f6B5ff6C975813F87A4dad0b241C15b'
  },
  { Pair: 'OHMv2 / ETH', Asset: 'Olympus v2', Type: 'Crypto', Address: '0x9a72298ae3886221820B1c878d12D872087D3a23' },
  { Pair: 'OKB / USD', Asset: 'OKB', Type: 'Crypto', Address: '0x22134617Ae0f6CA8D89451e5Ae091c94f7D743DC' },
  { Pair: 'OM / USD', Asset: 'Mantra DAO', Type: 'Crypto', Address: '0xb9583cfBdEeacd2705546F392E43F8E03eB92216' },
  { Pair: 'OMG / ETH', Asset: 'Omisego', Type: 'Crypto', Address: '0x57C9aB3e56EE4a83752c181f241120a3DBba06a1' },
  { Pair: 'OMG / USD', Asset: 'Omisego', Type: 'Crypto', Address: '0x7D476f061F8212A8C9317D5784e72B4212436E93' },
  { Pair: 'ONT / USD', Asset: 'Ontology', Type: 'Crypto', Address: '0xcDa3708C5c2907FCca52BB3f9d3e4c2028b89319' },
  { Pair: 'ORN / ETH', Asset: 'Orion Protocol', Type: 'Crypto', Address: '0xbA9B2a360eb8aBdb677d6d7f27E12De11AA052ef' },
  {
    Pair: 'OXT / USD',
    Asset: 'Orchid Protocol',
    Type: 'Crypto',
    Address: '0xd75AAaE4AF0c398ca13e2667Be57AF2ccA8B5de6'
  },
  { Pair: 'PAXG / ETH', Asset: 'Pax Gold', Type: 'Crypto', Address: '0x9B97304EA12EFed0FAd976FBeCAad46016bf269e' },
  {
    Pair: 'PERP / ETH',
    Asset: 'Perpetual Protocol',
    Type: 'Crypto',
    Address: '0x3b41D5571468904D4e53b6a8d93A6BaC43f02dC9'
  },
  {
    Pair: 'PERP / USD',
    Asset: 'Perpetual Protocol',
    Type: 'Crypto',
    Address: '0x01cE1210Fe8153500F60f7131d63239373D7E26C'
  },
  { Pair: 'PHA / USD', Asset: 'Phala Network', Type: 'Crypto', Address: '0x2B1248028fe48864c4f1c305E524e2e6702eAFDF' },
  {
    Pair: 'PHP / USD',
    Asset: 'Philippines Peso',
    Type: 'Forex',
    Address: '0x9481e7ad8BE6BbB22A8B9F7B9fB7588d1df65DF6'
  },
  { Pair: 'PLA / USD', Asset: 'Playdapp', Type: 'Crypto', Address: '0xbc535B134DdF81fc83254a3D0Ed2C0C60144405E' },
  {
    Pair: 'RAI / ETH',
    Asset: 'RAI Reflex Index',
    Type: 'Crypto',
    Address: '0x4ad7B025127e89263242aB68F0f9c4E5C033B489'
  },
  { Pair: 'RARI / ETH', Asset: 'Rarible', Type: 'Crypto', Address: '0x2a784368b1D492f458Bf919389F42c18315765F5' },
  { Pair: 'REN / ETH', Asset: 'Ren', Type: 'Crypto', Address: '0x3147D7203354Dc06D9fd350c7a2437bcA92387a4' },
  { Pair: 'REN / USD', Asset: 'Ren', Type: 'Crypto', Address: '0x0f59666EDE214281e956cb3b2D0d69415AfF4A01' },
  { Pair: 'REP / ETH', Asset: 'Augur', Type: 'Crypto', Address: '0xD4CE430C3b67b3E2F7026D86E7128588629e2455' },
  {
    Pair: 'REQ / USD',
    Asset: 'Request Network',
    Type: 'Crypto',
    Address: '0x2F05888D185970f178f40610306a0Cc305e52bBF'
  },
  { Pair: 'RLC / ETH', Asset: 'iExec RLC', Type: 'Crypto', Address: '0x4cba1e1fdc738D0fe8DB3ee07728E2Bc4DA676c6' },
  { Pair: 'RUNE / ETH', Asset: 'THORChain', Type: 'Crypto', Address: '0x875D60C44cfbC38BaA4Eb2dDB76A767dEB91b97e' },
  { Pair: 'SAND / USD', Asset: 'The Sandbox', Type: 'Crypto', Address: '0x35E3f7E558C04cE7eEE1629258EcbbA03B36Ec56' },
  {
    Pair: 'SGD / USD',
    Asset: 'Singapore Dollar',
    Type: 'Forex',
    Address: '0xe25277fF4bbF9081C75Ab0EB13B4A13a721f3E13'
  },
  { Pair: 'SHIB / ETH', Asset: 'Shiba Inu', Type: 'Crypto', Address: '0x8dD1CD88F43aF196ae478e91b9F5E4Ac69A97C61' },
  {
    Pair: 'SNX / ETH',
    Asset: 'Synthetix Network',
    Type: 'Crypto',
    Address: '0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c'
  },
  {
    Pair: 'SNX / USD',
    Asset: 'Synthetix Network',
    Type: 'Crypto',
    Address: '0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699'
  },
  { Pair: 'SOL / USD', Asset: 'Solana', Type: 'Crypto', Address: '0x4ffC43a60e009B551865A93d232E33Fce9f01507' },
  { Pair: 'SPELL / USD', Asset: 'Spell Token', Type: 'Crypto', Address: '0x8c110B94C5f1d347fAcF5E1E938AB2db60E3c9a8' },
  { Pair: 'SRM / ETH', Asset: 'Serum', Type: 'Crypto', Address: '0x050c048c9a0CD0e76f166E2539F87ef2acCEC58f' },
  {
    Pair: 'STETH / ETH',
    Asset: 'Lido Staked ETH',
    Type: 'Crypto',
    Address: '0x86392dC19c0b719886221c78AB11eb8Cf5c52812'
  },
  {
    Pair: 'SUSD / ETH',
    Asset: 'sUSD (Synthetix)',
    Type: 'Crypto',
    Address: '0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757'
  },
  { Pair: 'SUSHI / ETH', Asset: 'Sushi', Type: 'Crypto', Address: '0xe572CeF69f43c2E488b33924AF04BDacE19079cf' },
  { Pair: 'SUSHI / USD', Asset: 'Sushi', Type: 'Crypto', Address: '0xCc70F09A6CC17553b2E31954cD36E4A2d89501f7' },
  { Pair: 'SXP / USD', Asset: 'Swipe', Type: 'Crypto', Address: '0xFb0CfD6c19e25DB4a08D8a204a387cEa48Cc138f' },
  { Pair: 'TOKE / USD', Asset: 'Tokemak', Type: 'Crypto', Address: '0x104cD02b2f22972E8d8542867a36bDeDA4f104d8' },
  { Pair: 'TOMO / USD', Asset: 'Tomochain', Type: 'Crypto', Address: '0x3d44925a8E9F9DFd90390E58e92Ec16c996A331b' },
  { Pair: 'TRIBE / ETH', Asset: 'Tribe', Type: 'Crypto', Address: '0x84a24deCA415Acc0c395872a9e6a63E27D6225c8' },
  { Pair: 'TRU / USD', Asset: 'Truefi', Type: 'Crypto', Address: '0x26929b85fE284EeAB939831002e1928183a10fb1' },
  { Pair: 'TRY / USD', Asset: 'Turkish Lira', Type: 'Forex', Address: '0xB09fC5fD3f11Cf9eb5E1C5Dba43114e3C9f477b5' },
  { Pair: 'TSLA / USD', Asset: 'Tesla', Type: 'Equities', Address: '0x1ceDaaB50936881B3e449e47e40A2cDAF5576A4a' },
  { Pair: 'TUSD / ETH', Asset: 'TrueUSD', Type: 'Crypto', Address: '0x3886BA987236181D98F2401c507Fb8BeA7871dF2' },
  { Pair: 'TUSD / USD', Asset: 'True USD', Type: 'Crypto', Address: '0xec746eCF986E2927Abd291a2A1716c940100f8Ba' },
  { Pair: 'UMA / ETH', Asset: 'Uma', Type: 'Crypto', Address: '0xf817B69EA583CAFF291E287CaE00Ea329d22765C' },
  { Pair: 'UMEE / ETH', Asset: 'Umee', Type: 'Crypto', Address: '0xa554F3a8D05f22aC7e105311211AAbAf727e1CcB' },
  { Pair: 'UNI / ETH', Asset: 'Uniswap', Type: 'Crypto', Address: '0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e' },
  { Pair: 'UNI / USD', Asset: 'Uniswap', Type: 'Crypto', Address: '0x553303d460EE0afB37EdFf9bE42922D8FF63220e' },
  { Pair: 'USDC / ETH', Asset: 'Circle USD', Type: 'Crypto', Address: '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4' },
  { Pair: 'USDC / USD', Asset: 'Circle USD', Type: 'Crypto', Address: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6' },
  { Pair: 'USDK / USD', Asset: 'USDK', Type: 'Crypto', Address: '0xfAC81Ea9Dd29D8E9b212acd6edBEb6dE38Cb43Af' },
  { Pair: 'USDN / USD', Asset: 'Neutrino USD', Type: 'Crypto', Address: '0x7a8544894F7FD0C69cFcBE2b4b2E277B0b9a4355' },
  { Pair: 'USDP / USD', Asset: 'Pax Dollar', Type: 'Crypto', Address: '0x09023c0DA49Aaf8fc3fA3ADF34C6A7016D38D5e3' },
  { Pair: 'USDT / ETH', Asset: 'Tether', Type: 'Crypto', Address: '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46' },
  { Pair: 'USDT / USD', Asset: 'Tether USD', Type: 'Crypto', Address: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D' },
  {
    Pair: 'WBTC / BTC',
    Asset: 'Wrapped Bitcoin',
    Type: 'Crypto',
    Address: '0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23'
  },
  { Pair: 'WING / USD', Asset: 'Wing Finance', Type: 'Crypto', Address: '0x134fE0a225Fb8e6683617C13cEB6B3319fB4fb82' },
  { Pair: 'WNXM / ETH', Asset: 'Wrapped NXM', Type: 'Crypto', Address: '0xe5Dc0A609Ab8bCF15d3f35cFaa1Ff40f521173Ea' },
  { Pair: 'WTI / USD', Asset: 'WTI Crude', Type: 'Commodities', Address: '0xf3584F4dd3b467e73C2339EfD008665a70A4185c' },
  { Pair: 'XAG / USD', Asset: 'Silver', Type: 'Commodities', Address: '0x379589227b15F1a12195D3f2d90bBc9F31f95235' },
  { Pair: 'XAU / USD', Asset: 'Gold', Type: 'Commodities', Address: '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6' },
  { Pair: 'XCN / USD', Asset: 'Chain', Type: 'Crypto', Address: '0xeb988B77b94C186053282BfcD8B7ED55142D3cAB' },
  { Pair: 'XLM / USD', Asset: 'Stellar', Type: 'Crypto', Address: '0x64168007BAcbB5fF3f52639db22C6300827f5036' },
  { Pair: 'XMR / USD', Asset: 'Monero', Type: 'Crypto', Address: '0xFA66458Cce7Dd15D8650015c4fce4D278271618F' },
  { Pair: 'XRP / USD', Asset: 'Ripple', Type: 'Crypto', Address: '0xCed2660c6Dd1Ffd856A5A82C67f3482d88C50b12' },
  { Pair: 'YFI / ETH', Asset: 'Yearn Finance', Type: 'Crypto', Address: '0x7c5d4F8345e66f68099581Db340cd65B078C41f4' },
  { Pair: 'YFI / USD', Asset: 'Yearn Finance', Type: 'Crypto', Address: '0xA027702dbb89fbd58938e4324ac03B58d812b0E1' },
  { Pair: 'YFII / ETH', Asset: 'YFII Finance', Type: 'Crypto', Address: '0xaaB2f6b45B28E962B3aCd1ee4fC88aEdDf557756' },
  { Pair: 'ZRX / ETH', Asset: '0x', Type: 'Crypto', Address: '0x2Da4983a622a8498bb1a21FaE9D8F6C664939962' },
  { Pair: 'ZRX / USD', Asset: '0x', Type: 'Crypto', Address: '0x2885d15b8Af22648b98B122b22FDF4D2a56c6023' }
]

const SEPOLIA_ORACLES: OralceRecord[] = [
  { Pair: 'AUD / USD', Asset: '', Type: '', Address: '0xB0C712f98daE15264c8E26132BCC91C40aD4d5F9' },
  { Pair: 'BTC / ETH', Asset: '', Type: '', Address: '0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22' },
  { Pair: 'BTC / USD', Asset: '', Type: '', Address: '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43' },
  { Pair: 'CSPX / USD', Asset: '', Type: '', Address: '0x4b531A318B0e44B549F3b2f824721b3D0d51930A' },
  { Pair: 'CZK / USD', Asset: '', Type: '', Address: '0xC32f0A9D70A34B9E7377C10FDAd88512596f61EA' },
  { Pair: 'DAI / USD', Asset: '', Type: '', Address: '0x14866185B1962B63C3Ea9E03Bc1da838bab34C19' },
  { Pair: 'ETH / USD', Asset: '', Type: '', Address: '0x694AA1769357215DE4FAC081bf1f309aDC325306' },
  { Pair: 'EUR / USD', Asset: '', Type: '', Address: '0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910' },
  { Pair: 'FORTH / USD', Asset: '', Type: '', Address: '0x070bF128E88A4520b3EfA65AB1e4Eb6F0F9E6632' },
  { Pair: 'GBP / USD', Asset: '', Type: '', Address: '0x91FAB41F5f3bE955963a986366edAcff1aaeaa83' },
  { Pair: 'GHO / USD', Asset: '', Type: '', Address: '0x635A86F9fdD16Ff09A0701C305D3a845F1758b8E' },
  { Pair: 'IB01 / USD', Asset: '', Type: '', Address: '0xB677bfBc9B09a3469695f40477d05bc9BcB15F50' },
  { Pair: 'IBTA / USD', Asset: '', Type: '', Address: '0x5c13b249846540F81c093Bc342b5d963a7518145' },
  { Pair: 'JPY / USD', Asset: '', Type: '', Address: '0x8A6af2B75F23831ADc973ce6288e5329F63D86c6' },
  { Pair: 'LINK / ETH', Asset: '', Type: '', Address: '0x42585eD362B3f1BCa95c640FdFf35Ef899212734' },
  { Pair: 'LINK / USD', Asset: '', Type: '', Address: '0xc59E3633BAAC79493d908e63626716e204A45EdF' },
  { Pair: 'SNX / USD', Asset: '', Type: '', Address: '0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC' },
  { Pair: 'USDC / USD', Asset: '', Type: '', Address: '0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E' },
  { Pair: 'XAU / USD', Asset: '', Type: '', Address: '0xC5981F461d74c46eB4b0CF3f4Ec79f025573B0Ea' }
]

// Load price feed from https://docs.chain.link/docs/data-feeds/price-feeds/addresses/?network=ethereum
// and then use EACAggregatorProxy contract to get price
class DexPrice {
  USD_ORACLE_MAP = new Map<string, string>()
  ETH_ORACLE_MAP = new Map<string, string>()
  BTC_ORACLE_MAP = new Map<string, string>()
  ASSETS_INFOS = new Map<string, number>()

  readonly chainId: EthChainId

  constructor(chainId: EthChainId) {
    this.chainId = chainId
    const records = chainId === EthChainId.ETHEREUM ? ETHEREUM_ORACLES : SEPOLIA_ORACLES

    for (const record of records) {
      const pair = record.Pair.split('/')
      const asset = pair[0].trim().toLowerCase()
      const target = pair[1].trim().toLowerCase()
      const address = record.Address.toLowerCase()
      if (target === 'usd') {
        this.USD_ORACLE_MAP.set(asset, address)
      } else if (target === 'eth') {
        this.ETH_ORACLE_MAP.set(asset, address)
      } else if (target == 'btc') {
        this.BTC_ORACLE_MAP.set(asset, address)
      } else {
        console.error('wrong asset record:' + JSON.stringify(record))
      }
    }
  }

  // asset: symbol of the asset
  // unit: usd, eth or btc
  // blockTag: blockNumber of block symbol like "latest"
  // returns the asset price,
  // throw exception if calling to price feed failed, e.g. due to a invalid block number
  async getPrice(
    asset: string,
    blockTag: BlockTag = 'latest',
    unit: PriceUnit = PriceUnit.USD
  ): Promise<DexPriceResult> {
    // if (chainId !== 1 && chainId !== 5) {
    //   return {
    //     error: "current dex price only support chain 1 (mainnet) or 5 (goerli)"
    //   }
    // }

    let oracleMap = this.USD_ORACLE_MAP
    switch (unit) {
      case PriceUnit.ETH:
        oracleMap = this.ETH_ORACLE_MAP
        break
      case PriceUnit.BTC:
        oracleMap = this.BTC_ORACLE_MAP
        break
      default:
    }

    asset = asset.trim().toLowerCase()

    const addr = oracleMap.get(asset)
    if (!addr) {
      return {
        error: 'No price feed found for asset'
      }
    }

    const contract = getEACAggregatorProxyContract(this.chainId, addr)
    try {
      const price = await contract.latestAnswer({
        blockTag: blockTag
      })

      let decimal = this.ASSETS_INFOS.get(asset)
      if (!decimal) {
        decimal = Number(await contract.decimals())
        this.ASSETS_INFOS.set(asset, decimal)
      }

      return {
        price: scaleDown(price, decimal).toNumber()
      }
    } catch (e) {
      return {
        error:
          'Price query error for ' +
          asset +
          ' failed at ' +
          addr +
          ' at chain ' +
          this.chainId +
          '. Details: ' +
          e.toString()
      }
    }
  }
}

export const EthereumDexPrice = new DexPrice(EthChainId.ETHEREUM)
export const SepoliaDexPrice = new DexPrice(EthChainId.SEPOLIA)
