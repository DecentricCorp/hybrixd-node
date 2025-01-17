# Recipes

A recipe file is a json file describing the properties of a source or
asset (also token) implementation.

Example for an asset foo with properties host and cache and quartz program for balance that
does something and returns something:

```
source.foo.json
{
"symbol" :"foo",
    "host" : "localhost:123",
    "cache" : 12000,
    "quartz" : {
    "balance" : ["dosomething", "returnsomething"]
    },
    "router" : {
        "balance" : "Does something and then returns something to the user."
    }
}
```

A recipe defines either an asset/token or a source. For assets (and tokens) a symbol is
required, for sources an id.

## Filename

For assets the filename is defined as `/recipes/asset.$SYMBOL.json` or `/recipes/token.$SYMBOL.json`

For sources the filename is defined as `/recipes/source.$TYPE.$ID.json`

For engines the filename is defined as `/recipes/engine.$NAME.json`

## Properties:

symbol
(Only required for assets)
Discription: A string containing the symbol. This is used as the main idenitfier.
Format: "$base[.$token]"
Examples: "BTC", "ETH.SHIFT"

source
(Only required for sources)
Discription:
Examples: "abe.bitcoin", "insight.litecoin", "deterministic"

engine
(Only required for engines)
Discription:
Examples: "storage"

name
Discription: A string containing the display name (for pretty printing).
Example: "Bitcoin"

mode
Discription: A string containing the deterministic mode.
Format: "$DeterministicModule.$modus"
Example: "bitjoinjslib.bitcoin"

modus
Discription: A string containing the internal asset identifier.
Example: "bitcoin","ethereum"

contract
(Only required for token assets)
Description: The unique identifier for an asset token

originator
(Only required for token assets)
Description: The creator or origin address for an asset token

import
Discription: A string or array of strings containing the id's /
symbols of the recipes from which this recipe should inherit
properties. Cf Import section below
Example: "btc", ["btc","eth"] , "btc::host"

module:
Discription:  The name of the server/node side code implementation

module-deterministic
(Only required for assets)
Discription: The name of the client side code implementation  (TODO TO BE RENAMED!)

factor
(Only required for assets)
Discription: The number of decimal digits used for this asset.

fee
(Only required for assets)
Discription: A number representing the fee associated with
transfering assets

fee-symbol
(Optional for assets)
Discription: the symbol in which the fee is calculated

generated
Discription: A string indicating whether an address needs to
be generated
never : no generation needed,
once : generation only needed once,
always : generation each time you want to receive a transferr
Example: "never", "once", "always"



host                  A string or array of strings containing the hosts


[cache]               The ammount of time in miliseconds that data should be cached (Defaults to 12000)
[throttle]            Defaults to 5
[retry]               Defaults to 3
[timeout]             Defaults to 15000
[interval]            Defaults to 2000

The following properties are used to initialize the connection: (cf
https://www.npmjs.com/package/node-rest-client#options-parameters )

[user]
[pass]
[proxy]
[connection]
[mimetypes]
[requestConfig]
[responseConfig]


quartz                Defines the quartz code.

router                Defines the routing definitions. See
$HYBRIXD/lib/router/README-router.txt


## Quartz


Cf. $HYBRIXD_HOME/lib/README-scheduler


## $ Operator  $PROPERTY

For Quartz commands the $ is used (inspired by Bash) to retrieve variables:


Calling `../foo/balance/bar` on

```
source.foo.json
{
  "id" :"foo",
  "a" : 1,
  "b" : 2,
  "quartz" : {
           "balance" : ["dosomething with $a, $b, $0", "returns $1"]
  }
}
```

Compiles to

```
source.foo.json
{
  "id" :"foo",
  "a" : 1,
  "b" : 2,
  "quartz" : {
           "balance" : ["dosomething with 1, 2, balance", "returns bar"]
  }
}
```

## Cross recipe variables  $RECIPE::PROPERTY

The `$foo::bar` notation can be used to reference variables in other
(non imported files)

Given

```
source.foo.json
{
  "id" :"foo",
  "a" : 1,
}
```

then

```
source.bar.json
{
  "id" :"bar",
  "a" : -1,
  "quartz" : {
           "balance" : ["dosomething with $a, $foo::a", "returnsomething"]
  }
}
```

Compiles to:


```
{
  "id" :"bar",
  "a" : -1,
  "quartz" : {
           "balance" : ["dosomething with -1, 1", "returnsomething"]
  }
}
```

## Import

Inheritance using `"import"`:

Given foo.json

```
source.foo.json
{
  "id" :"foo",
  "a" : 1,
  "b" : 2,
}
```


`bar.json` can inherit `foo.json` by using

```
source.bar.json
{
  "id" :"bar",
  "a" : -1,
  "c" : 3,
  "import" : "foo"
}
```


which compiles to

```
source.bar.json
{
  "id" :"bar",
  "a" : -1,
  "b" : 2,
  "c" : 3,
  "import" : "foo"
}
```


Note that the value of `a` is retained, bu `b` is added.


## Multi-inheritance

Multi-inheritance can be defined by using:

```
source.bar.json
{
  "id" :"bar",
  "a" : -1,
  "c" : 3,
  "import" : ["foo1","foo2","foo3"]
}
```


They are imported from left to right (values in `foo3` overwrite those of `foo1` and `foo2`)


## Specific inheritance

Specific inheritance can be defined by using

```
source.foo.json
{
  "id" :"foo",
  "a" : 1,
  "b" : 2,
  "c" : 3,
}
```


bar.json can inherit foo.json by using

```
source.bar.json
{
  "id" :"bar",
  "a" : -1,
  "import" : "foo::b"
}
```


which compiles to

```
source.bar.json
{
  "id" :"bar",
  "a" : -1,
  "b" : 2,
  "import" : "foo::b"
}
```

## Token inheritance

A token asset, identified by a two part symbol "$base.$token", for
example: "ETH.SHIFT" will automatically inherit the Quartz code from its
base asset.
