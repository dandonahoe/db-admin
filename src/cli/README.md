vtcli
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/vtcli.svg)](https://npmjs.org/package/vtcli)
[![Downloads/week](https://img.shields.io/npm/dw/vtcli.svg)](https://npmjs.org/package/vtcli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g vtcli
$ vtcli COMMAND
running command...
$ vtcli (--version)
vtcli/0.0.0 linux-arm64 node-v22.12.0
$ vtcli --help [COMMAND]
USAGE
  $ vtcli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`vtcli hello PERSON`](#vtcli-hello-person)
* [`vtcli hello world`](#vtcli-hello-world)
* [`vtcli help [COMMAND]`](#vtcli-help-command)
* [`vtcli plugins`](#vtcli-plugins)
* [`vtcli plugins add PLUGIN`](#vtcli-plugins-add-plugin)
* [`vtcli plugins:inspect PLUGIN...`](#vtcli-pluginsinspect-plugin)
* [`vtcli plugins install PLUGIN`](#vtcli-plugins-install-plugin)
* [`vtcli plugins link PATH`](#vtcli-plugins-link-path)
* [`vtcli plugins remove [PLUGIN]`](#vtcli-plugins-remove-plugin)
* [`vtcli plugins reset`](#vtcli-plugins-reset)
* [`vtcli plugins uninstall [PLUGIN]`](#vtcli-plugins-uninstall-plugin)
* [`vtcli plugins unlink [PLUGIN]`](#vtcli-plugins-unlink-plugin)
* [`vtcli plugins update`](#vtcli-plugins-update)

## `vtcli hello PERSON`

Say hello

```
USAGE
  $ vtcli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ vtcli hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/cli/vtcli/blob/v0.0.0/src/commands/hello/index.ts)_

## `vtcli hello world`

Say hello world

```
USAGE
  $ vtcli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ vtcli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/cli/vtcli/blob/v0.0.0/src/commands/hello/world.ts)_

## `vtcli help [COMMAND]`

Display help for vtcli.

```
USAGE
  $ vtcli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for vtcli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.19/src/commands/help.ts)_

## `vtcli plugins`

List installed plugins.

```
USAGE
  $ vtcli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ vtcli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/index.ts)_

## `vtcli plugins add PLUGIN`

Installs a plugin into vtcli.

```
USAGE
  $ vtcli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into vtcli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VTCLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VTCLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ vtcli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ vtcli plugins add myplugin

  Install a plugin from a github url.

    $ vtcli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ vtcli plugins add someuser/someplugin
```

## `vtcli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ vtcli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ vtcli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/inspect.ts)_

## `vtcli plugins install PLUGIN`

Installs a plugin into vtcli.

```
USAGE
  $ vtcli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into vtcli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VTCLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VTCLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ vtcli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ vtcli plugins install myplugin

  Install a plugin from a github url.

    $ vtcli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ vtcli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/install.ts)_

## `vtcli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ vtcli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ vtcli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/link.ts)_

## `vtcli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vtcli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vtcli plugins unlink
  $ vtcli plugins remove

EXAMPLES
  $ vtcli plugins remove myplugin
```

## `vtcli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ vtcli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/reset.ts)_

## `vtcli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vtcli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vtcli plugins unlink
  $ vtcli plugins remove

EXAMPLES
  $ vtcli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/uninstall.ts)_

## `vtcli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vtcli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vtcli plugins unlink
  $ vtcli plugins remove

EXAMPLES
  $ vtcli plugins unlink myplugin
```

## `vtcli plugins update`

Update installed plugins.

```
USAGE
  $ vtcli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/update.ts)_
<!-- commandsstop -->
