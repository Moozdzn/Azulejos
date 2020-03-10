![University](https://www.iade.europeia.pt/hs-fs/hubfs/IADE-SITE/static/ue-iade-h75.png?width=444&name=ue-iade-h75.png)
# Azulejos Aplicação Móvel - Relatório

### Licenciatura em Engenharia Informática | Ano Letivo 2019/2020 


Aluno | Email | Número
------------ | ------------- | -------------
Diogo Santos | moozdzn@gmail.com | 50038023

Docentes | Email 
------------ | ------------- 
Jacinto Estima | jacinto.estima@universidadeeuropeia.pt 
Miguel Bugalho | miguel.bugalho@universidadeeuropeia.pt

## Enquadramento
A azulejaria portuguesa é um retrato da nossa história e tem se tornado também um cartão de visita sendo inspiração para vários produtos.
Os azulejos e a sua história estão espalhados por todo o país desde edifícios históricos até casas particulares. 
O objetivo deste projeto é criar uma aplicação móvel para visualização e recolha de informação sobre azulejos incluindo imagens, anotações e localizações.
A ideia será usar a aplicação móvel para fazer crowdsourcing de recolha de informação sobre os azulejos e permitir assim conhecermos um pouco mais da nossa história e do nosso património. 
Um utilizador desta aplicação deverá conseguir visualizar informação sobre que exemplos de azulejos existem perto da sua localização e enviar nova informação sobre azulejos que encontrou (tirar fotografias, obter a localização e adicionar anotações). A informação enviada deverá ser depois curada por especialistas.
   
# Cenários
## Cenário Principal
1.O utilizador abre a aplicação “Azulejos”.
2.A aplicação apresenta o ecrã principal composto por um mapa centrado na localização atual do utilizador, com marcadores para a sua localização e para a localização de azulejos ao seu redor.
3.O utilizador escolhe um marcador no mapa ou, em alternativa, escreve na barra de pesquisa.
4.A aplicação mostra a informação relativa ao azulejo (fotografias, anotações).
## Cenário Secundário
1.O utilizador, no ecrã principal da aplicação, carrega no botão “+” para adicionar um novo azulejo á aplicação.
2.A aplicação apresenta uma interface para uma nova submissão onde o utilizador pode adicionar fotografias, anotações e confirma a localização do azulejo.
3.O utilizador confirma esta nova submissão que é enviada para ser curada por especialistas e volta ao ecrã principal.

## Cenário Secundário
O utilizador acede a uma interface onde pode ver as suas submissões e o seu estado

## Plano de Trabalhos
![WorkPlanImage](https://raw.githubusercontent.com/Moozdzn/Azulejos/master/attachments/WorkPlanV1.png)

### Nota: Os pontos abaixo não são pedidos para a 1ª entrega. No entanto, por haver tempo os mesmos, já se encontram definidos para obter feedback o quanto antes.

## Requisitos Funcionais
![Functional Requirements](https://raw.githubusercontent.com/Moozdzn/Azulejos/master/attachments/FRV1.png)

## Mockups e Interfaces
![Main Screen](https://raw.githubusercontent.com/Moozdzn/Azulejos/master/attachments/mockups/mainScreenV1.png)
![Information Screen](https://raw.githubusercontent.com/Moozdzn/Azulejos/master/attachments/mockups/informationScreenV1.png)
![New Session Screen](https://raw.githubusercontent.com/Moozdzn/Azulejos/master/attachments/mockups/newSessionV1.png)

## Modelo de Domínio
![Domain Model](https://github.com/Moozdzn/Azulejos/blob/master/attachments/App-azulejos-diagrama.png)

## Máquina de Estados
![State Machine](https://raw.githubusercontent.com/Moozdzn/Azulejos/master/attachments/StateMachine.png)

## Referências
História do Azulejo (Museu do Azulejo). Acedidos a 17/02/2020 : 
  > http://www.museudoazulejo.gov.pt/Data/Documents/Cronologia%20do%20Azulejo%20em%20Portugal.pdf
  > http://www.museudoazulejo.gov.pt/Data/Documents/Percurso%20MNAz.pdf

Azulejo Português: Património Mundial (GlazeArch2015) Acedido a 17/02/2020:
  > http://azulejos.lnec.pt/AzuRe/links/02%20Portuguese%20Azulejos%20World%20Heritage.pdf
  
COOLTURA (Cordis | European Commission). Acedido a 01/03/2020:
  > https://cordis.europa.eu/article/id/118605-app-aims-to-make-cultural-heritage-interesting-and-interactive
  
Stedr (DigitalInclusion.no). Acedido a 01/03/2020:
  > http://inkluderendedigitalisering.no/en/2013/11/22/tag-cloud-a-successful-student-project-at-ntnu/
  
MNAZ (Museu do Azulejo). Acedido a 7/03/2020:
  > http://www.museudoazulejo.gov.pt/en-GB/ExhibitAct/Event/ContentDetail.aspx?id=1647
  
Lokals (Volta ao mundo). Acedido a 7/03/2020:
  > https://www.voltaaomundo.pt/2020/03/03/nova-app-turistica-americana-sobre-portugal-e-lancada-em-lisboa-lokals/noticias/719850/
