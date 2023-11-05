# Development of a real use case supply chain

## Introduccion

En este curso vamos a desarrollar una aplicación descentralizada para emular el funcionamiento de un caso de uso real de una cadena de suministro. Este podría ser un caso real en su estado más temprano de desarrollo, dentro de un consorcio de empresas y donde una de ellas adopta una posición de “líder”, que pasaremos a llamar “owner o administrador”.

Esta aplicación tiene dos objetivos: ser transparentes con el consumidor y ser justos con los agricultores. Por un lado, se le va a proporcionar al consumidor de una traza exacta y fiable de qué es lo que ha ocurrido con su producto. Y por otro lado, el consumidor va a poder observar que un porcentaje del precio de su producto ha ido destinado directamente al agricultor, evitando así casos que se pueden observar actualmente en los que los consumidores pagamos un precio por kilo de producto y finalmente al agricultor prácticamente no le llegan ingresos para cubrir costes. Se puede intuir que esta funcionalidad descrita la obtendremos definiendo tres roles diferentes en la aplicación: agricultor, panadero y consumidor, cada uno con una interfaz de usuario propia y sus respectivas funcionalidades. 

Para el desarrollo nos apoyaremos en la librería disponible de OpenZeppelin ERC-721 para minar NFTs o, como llamaremos a lo largo del curso, productos, ya que crearemos con esta librería lo que se conoce como “digital twins” o “gemelos virtuales” en español. Esto no es más que la representación digital de un objeto físico. Este gemelo virtual será el que se irá modificando a la vez que lo haría hipotéticamente el objeto físico.

En cuanto a tecnologías, vamos a usar Solidity, más exactamente la librería anteriormente mencionado además de la librería Ownable, React 18.2.0 para la interfaz de usuario, y Hardhat para ayudarnos a desarrollar el contracto, testearlo y desplegarlo en la red de pruebas Goerli.  Además, vamos a usar Metamask como cartera para almacenar nuestras diferentes cuentas y usaremos Fleek para alojar nuestra aplicación en un sitio web haciendo uso, además, de IPFS.

## Curso

https://www.udemy.com/course/blockchain-supplychain-dapp/