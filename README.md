# Guía de frontend NextJS - web3 sept - 22 - 2024 👀

En esta guía encontraras la manera de integrar un proyecto frontend creado con NextJs a contratos inteligentes.

# Instalación

Para instalar las dependencias necesarias correremos el siguiente comando

```javascript:
npm i @web3modal/wagmi wagmi viem @tanstack/react-query
```

Con lo anterior estás instalando :

- La modal para conectar con billeteras de wallet connect (dizque reown pero para mi es wallet connect) **web3modal/wagmi**
- La librería para interactuar con los diferentes métodos de los contratos inteligentes, blockchain e interactuar con las billeteras conectadas mediante hooks de react **wagmi**
- La librería nativa de js que hace que los hooks de **wagmi** funcionen: [viem](https://viem.sh); similar a esta existe [etherjs](https://docs.ethers.org/v5) y [web3js](https://docs.web3js.org).
- La librería necesaria para manejar los estados asíncronos **@tanstack/react-query**

# Configuración

A continuación, vamos a configurar los pasos necesarios para integrar nuestro frontend con las diferentes redes y lo mínimo para poder interactuar con los diferentes contratos inteligentes.

## Crearse una cuenta en Wallet Connect (Reown)

En este paso es necesario crearse una cuenta en [Wallet Connect](https://cloud.reown.com) (Ahora Reown), para hacerlo puedes crearte una cuenta con una wallet, aunque suele fallar esta opción (al menos en mi caso) por lo que me tocó crearme un correo x para crearme una cuenta, puedes conectarte con tu correo sin ningún problema.

Una vez te hayas creado una cuenta, le das en crear proyecto, creas uno y le pones cualquier nombre (Test puede ser uno), lo ideal es que sea referente a tu proyecto.

Creada la cuenta y el proyecto, tendrá acceso a tu projectId, el cual copiaremos y agregaremos a las variables de entorno.

Para simplificar los pasos guardaremos nuestro projectId como variable de entorno publica, para esto seguiremos los siguientes pasos (en un ambiente real de producción debes tomar las medidas de ciberseguridad pertinente de las variables de entorno):

- Crear un archivo en la ruta raíz llamado **.env**, se debe ver así **miCarpetaPrincipal/.env**.
- En este archivo copiaremos el siguiente texto:

```javascript
NEXT_PUBLIC_PROJECT_ID = MyProjectId;
```

- Cabe aclarar que **MyProjectId** es el projectId que obtuviste de wallet connect (Ahora Reown)

## Crear el archivo de configuración

Para el archivo de configuración vamos a crear una carpeta en la ruta raíz llamada **config** y allí crearemos un archivo llamado **index.tsx**, esto se debe ver así **miCarpetaPrincipal/config/index.tsx**.

En este archivo copiaremos el siguiente código:

```Typescript
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { cookieStorage, createStorage } from 'wagmi';
import { avalancheFuji, sepolia } from 'wagmi/chains';

const projectId = String(process.env.NEXT_PUBLIC_PROJECT_ID);
const metadata = {
	name: 'Testing',
	description: 'AppKit Example',
	url: 'https://reown.com/appkit',
	icons: ['https://assets.reown.com/reown-profile-pic.png'],
};

const chains = [avalancheFuji, sepolia] as const;

export const config = defaultWagmiConfig({
	chains,
	projectId,
	metadata,
	ssr: true,
	storage: createStorage({
		storage: cookieStorage
	}),
});
```

## Crear el archivo de contexto

Para el archivo de contexto vamos a crear una carpeta en la ruta raíz llamada **context** y allí crearemos un archivo llamado **index.tsx**, esto se debe ver así **miCarpetaPrincipal/context/index.tsx**.

En este archivo copiaremos el siguiente código:

```Typescript
"use client";

import  React, { ReactNode } from  "react";
import { config, projectId } from  "../config";
import { createWeb3Modal } from  "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from  "@tanstack/react-query";
import { State, WagmiProvider } from  "wagmi";

// Setup queryClient
const  queryClient  =  new  QueryClient();
if (!projectId) throw  new  Error("Project ID is not defined");

// Create modal
createWeb3Modal({
	wagmiConfig:  config,
	projectId,
	enableAnalytics:  true,
	enableOnramp:  true,
});

export  default  function  Web3ModalProvider({
	children,
	initialState,
}: {
	children:  ReactNode;
	initialState?:  State;
}) {
	return (
		<WagmiProvider  config={config}  initialState={initialState}>
			<QueryClientProvider  client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	);
}
```

## Editar el archivo de Layout

Este archivo suele estar en la ruta **miCarpetaPrincipal/src/app/layout.tsx**, una vez allí vamos a agregar el siguiente código:

```Typescript
import { headers } from "next/headers";
import { cookieToInitialState } from  "wagmi";
import { config } from  "../../config";
import  Web3ModalProvider  from  "../../context";
```

Del export default como el de a continuación:

```Typescript
export  default  function  RootLayout({
	children,
}:  Readonly<{
	children:  React.ReactNode;
}>) {
	return (
		<html  lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				{children}
			</body>
		</html>
	);
}
```

Agregaremos una variable antes del return

```Typescript
const  initialState  =  cookieToInitialState(config, headers().get("cookie"));
```

Y envolveremos el **{{children}}** así:

```Typescript
<Web3ModalProvider initialState={initialState}>
	{children}
</Web3ModalProvider>
```

Lo que nos dará un export default como el siguiente:

```Typescript
export  default  function  RootLayout({
	children,
}:  Readonly<{
	children:  React.ReactNode;
}>) {
	const  initialState  =  cookieToInitialState(config, headers().get("cookie"));
	return (
		<html  lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<Web3ModalProvider  initialState={initialState}>
					{children}
				</Web3ModalProvider>
			</body>
		</html>
	);
}
```

## Integración de una billetera

En este paso vamos a abrir el archivo que requiere la interacción con el contrato inteligente y asegurar que tenga una integración con la billetera, en mi caso es en el archivo principal (**miCarpetaPrincipal/src/app/page.tsx**), el cual se ve así:

```Typescript
import  styles  from  "./page.module.css";
import { SendTransaction } from  "../../utils/send-transaction";

export  default  function  Home() {
	return (
		<div  className={styles.page}>
			<main  className={styles.main}>
				<w3m-button  />
				<p>Empezando</p>
			</main>
		</div>
	);
}
```

Se puede ver como se agrego

```Html
<w3m-button/>
```

Ya que este archivo está envuelto en el contexto y la configuración no hay que importar nada para hacer uso de algunas funcionalidades como esta.

# Conexión con contratos inteligentes

Una vez se haya configurado el proyecto frontend sigue la interacción con los contratos inteligentes, la veremos a continuación usando la documentación de [Wagmi](https://wagmi.sh)

## Contexto de contratos inteligentes a utilizar

Para este ejemplo cree un ERC20 haciendo uso de openzeppelin, el cual se ve así:

```Javascript
// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma  solidity  ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract USDT is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
	constructor(address initialOwner)
		ERC20("USDT", "USDT")
		Ownable(initialOwner)
		ERC20Permit("USDT")
	{
		_mint(msg.sender, 1000 * 10 ** decimals());
	}

	function pause() public onlyOwner {
		_pause();
	}

	function unpause() public onlyOwner {
		_unpause();
	}

	 function mint(address to,  uint256 amount)  public onlyOwner {
		_mint(to, amount);
	}

	// The following functions are overrides required by Solidity.
	function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
		super._update(from, to, value);
	}
}
```

Este contrato inteligente tiene un ABI, el cual es requerido para su integración, así mismo debe estar desplegado en alguna red, en este ejemplo usé Avalanche C-Chain para dicho despliegue, con esta información lista, crearemos un archivo a nivel raíz llamado **constants.json** el cual contendrá esta información, este contenido se verá así:

```Json
{
	"usdtFujiAddress": "0x57E96e206804D4D71778207C2c28d85Db7bf4ABb",
	"usdtFujiAbi": [
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "spender",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "value",
					"type": "uint256"
				}
			],
			"name": "approve",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		...
	]
}
```

Evidentemente corte el abi, porque es demasiado largo, pero este lo puedes obtener al momento de compilar tu contrato inteligente.

## Integración

En este punto ya es momento de empezar a integrar con los contratos inteligentes, para esto decidí crear una librería y desacoplar el código, para esto cree una carpeta a nivel raíz llamada **utils** y en ella cree un archivo llamado **send-transaction.tsx**, en este archivo agregaremos el siguiente código:

```Typescript
"use client";
import * as React from "react";
import {
	useWriteContract,
	useReadContract,
	useAccount,
	useWaitForTransactionReceipt,
	UseReadContractReturnType,
} from "wagmi";
import contract from "../constants.json";

export function SendTransaction() {
	const { writeContract, data: hash, isPending } = useWriteContract();
	const { address: myAddress } = useAccount();

	const balanceUser: UseReadContractReturnType = useReadContract({
		abi: contract.usdtFujiAbi,
		address: contract.usdtFujiAddress  as  `0x${string}`,
		functionName: "balanceOf",
		args: [myAddress],
	});

	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const  formData  =  new  FormData(e.target  as  HTMLFormElement);
		const  to  =  formData.get("address") as  `0x${string}`;
		const  value  =  formData.get("value") as  string;
		writeContract({
			abi:  contract.usdtFujiAbi,
			address:  contract.usdtFujiAddress  as  `0x${string}`,
			functionName:  "transfer",
			args: [to, value],
		});
	}

	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({hash});

	return (
		<form  onSubmit={submit}>
			<input  name="address"  placeholder="0xA0Cf…251e"  required  />
			<input  name="value"  placeholder="0.05"  required  />
			<div>
				{balanceUser.data
					? `Tu balance es de: ${Number(balanceUser.data) / 10 ** 18}`
					: ""}
			</div>
			<button  disabled={isPending}  type="submit">
				{isPending ? "Confirmando Transacción..." : "Enviada"}
			</button>
			{isConfirming && <div>Esperando confirmación...</div>}
			{isConfirmed && <div>Transacción confirmada.</div>}
			{hash && <div>Transaction Hash: {hash}</div>}
		</form>
	);
}
```

Repasemos ahora que usamos 4 funciones nuevas:

- **useWriteContract**: hook para enviar transacciones que modifican el estado de un contrato inteligente.
- **useReadContract**: hook para leer el estado de las variables de los contratos inteligentes.
- **useAccount**: hook para obtener la información de la billetera que está conectada.
- **useWaitForTransactionReceipt**: hook para esperar a que la transacción se agregue a la blockchain y el estado se haya empezado a propagar por la red.
- **UseReadContractReturnType**: Tipado para **useReadContract**.

Empecemos a explicar cada uno:

### useWriteContract

Este se importa de Wagmi

```Typescript
import { useWriteContract } from "wagmi";
```

Una vez se ha importado se declara y se instancia en el cuerpo del export de la función principal

```Typescript
import { useWriteContract } from "wagmi";
...

export function SendTransaction() {
	const { writeContract, data: hash, isPending } = useWriteContract();
	...
}
```

De este hook podemos obtener **writeContract** para iniciar el llamado con el contrato inteligente, **data** con el hash de la transacción, **isPending** con un estado referente a un estado de espera a que el usuario confirme o rechace la transacción.
Estos últimos dos se usan principalmente para logs o mostrar algo al usuario, veamos a continuación, el uso de **writeContract**.

```Typescript
import { useWriteContract } from "wagmi";
import  contract  from  "../constants.json";
...

export function SendTransaction() {
	const { writeContract, data: hash, isPending } = useWriteContract();
	...
	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const to = formData.get("address") as `0x${string}`;
		const value = formData.get("value") as string;
		writeContract({
			abi: contract.usdtFujiAbi,
			address: contract.usdtFujiAddress as `0x${string}`,
			functionName: "transfer",
			args: [to, value],
		});
	}
}
```

Este método se debe llamar dentro de una función y entre los parámetros necesarios que se deben mandar tiene:

- El ABI
- La dirección del contrato inteligente
- El nombre de la función que se está llamando
- Los argumentos en caso de ser necesarios de la función

### useReadContract

Este se importa de Wagmi

```Typescript
import { useReadContract } from "wagmi";
```

Una vez se ha importado se llama en el cuerpo del export de la función principal

```Typescript
import { useReadContract } from "wagmi";
...

export function SendTransaction() {
	const balanceUser: UseReadContractReturnType = useReadContract({
		abi: contract.usdtFujiAbi,
		address: contract.usdtFujiAddress  as  `0x${string}`,
		functionName: "balanceOf",
		args: [myAddress],
	});
	...
}
```

Esto nos dara varios atributos para **balanceUser** entre los que se encuentra **data** con la información proveniente del contrato (Si es un número llega en **BigInt** por lo que envuelve el valor en un **Number** y lo tendrás manipulable), si se requiere llamar de nuevo se llama el atributo **refetch** dentro de una función

```Typescript
import { useReadContract } from "wagmi";
...

export function SendTransaction() {
	const balanceUser: UseReadContractReturnType = useReadContract({
		abi: contract.usdtFujiAbi,
		address: contract.usdtFujiAddress  as  `0x${string}`,
		functionName: "balanceOf",
		args: [myAddress],
	});
	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const oldBalance = Number(balanceUser.data)
		await balanceUser.refetch()
		const newBalance = Number(balanceUser.data)
		...
	}
	...
}
```

Este método se debe llamar a nivel raíz, y en caso de ser el refetch dentro de una función y entre los parámetros necesarios que se deben mandar tiene:

- El ABI
- La dirección del contrato inteligente
- El nombre de la función que se está llamando
- Los argumentos en caso de ser necesarios de la función

### Continuará ...
