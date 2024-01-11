const fs = require('fs');
const axios = require('axios');

const Groundon = require('../models/Groundon');
const GroundonView = require('./GroundonView');
const MewTwo = require('../models/IA Models/MewTwo_NLP_IA')

const Cliente = require('../models/Regras de Negocio/Cliente/Cliente')

const Widgets = require('../models/widgets/Widgets')

//const Stage1 = require('./Stages/Estagio1')
const Estagio2 = require('./Stages/Estagio2');
const Estagio3 = require('./Stages/Estagio3');

const cliente = new Cliente()


/*
TODO 

Robo fazer consulta de dados pelo ID do pedido e telefone

Vai conseguir colocar “raio de atendimento” ? 
Pra direcionar o pedido pra loja A ou B e quem estiver fora da área, ser avisado que não dá pra prosseguir?

Mas mesmo cada loja tendo um número tem que ter um “você está fora da área de entrega”
*/


class StagesView extends GroundonView {
    constructor(whatsapp, groundonController, backendController) {
        super(whatsapp, groundonController, backendController);
        //this.estagio1 = new Stage1()
        this.estagio2 = new Estagio2()
        this.estagio3 = new Estagio3()
        this.clientes = {};
        this.Widgets = new Widgets()

        this.isNLPMode = false;
        this.mewTwo = new MewTwo();  // Instantiate MewTwo in the constructor

        this.dailyOrderCount = {}; // Armazena a contagem diária de pedidos por número de telefone

    }

    incrementOrderCount(phoneNumber) {
        if (!this.dailyOrderCount[phoneNumber]) {
            this.dailyOrderCount[phoneNumber] = 0;
        }
        this.dailyOrderCount[phoneNumber]++;
    }

    resetDailyOrderCount() {
        this.dailyOrderCount = {};
    }

    async start_chatbot_IA(message) {
        this.isNLPMode = true;
        this.enviarMensagem(message, 'Olá, sou o Mewtwo. Você está agora no modo de treinamento  NLP. Digite "!sair" para sair.');
    }


    async mewtwoProcessa(message) {
        try {
            // Processar a mensagem usando MewTwo
            const resposta_intent = await this.mewTwo.processIntent(message.body);

            const cleanIntent = resposta_intent.intent.trim().replace(/"/g, '');
            const resposta = this.mewTwo.getResponseForIntent(cleanIntent);
            console.log(`Debug: ${resposta} | ${resposta_intent} `)

            // Se a resposta foi bem-sucedida, envie a resposta para o usuário
            if (resposta) {

                this.enviarMensagem(message, `Resp. Mewtwo: ${resposta}`);
            } else {
                this.enviarMensagem(message, 'Desculpe, não consegui entender sua mensagem.');
            }

            // Obter o estágio com base na intenção
            const stage = this.mewTwo.getStageForIntent(resposta_intent.intent);

            // Se um estágio foi identificado, navegue para ele
            if (stage) {
                this.pushStage(stage);
                this.navigateToStage(stage);
                console.log(`\n\nStage of Mewtwo: ${stage}`);
            } else {
                console.log('\n\nResposta Mewtwo fora do Groundon')
            }
        } catch (error) {
            console.error('Erro ao processar a mensagem:', error);
            this.enviarMensagem(message, 'Desculpe, ocorreu um erro ao processar sua mensagem.');
        }
    }


    async mewtwoRespondeItemDoMenu(selectedOption) {
        const texto_item_selecionado = selectedOption.button.text.slice(3);
        const resposta_choice = await this.mewTwo.processIntent(texto_item_selecionado);

        this.enviarMensagem(message, `Voce escolheu a opção *${texto_item_selecionado}*`);
        this.enviarMensagem(message, resposta_choice.answer);

        // Você pode adicionar mais lógica aqui se necessário para ações específicas do menu.
    };

    async mewtwoRespondeMensagem(message) {
        const resposta_intent = await this.mewTwo.processIntent(message.body);
        const cleanIntent = resposta_intent.intent.trim().replace(/"/g, '');
        const resposta = this.mewTwo.getResponseForIntent(cleanIntent);

        // Se a resposta foi bem-sucedida, envie a resposta para o usuário.
        if (resposta) {
            this.enviarMensagem(message, `Resp. Mewtwo: ${resposta}`);
        } else {
            this.enviarMensagem(message, 'Desculpe, não consegui entender sua mensagem.');
        }

        // Adicione qualquer outra lógica necessária para tratar a resposta do MewTwo.
    };


    resetEstagio(message, num_stage, phone) {

        if (message.body === "!") {
            const previousStage = num_stage - 2; // Get the previous stage from the stack

            if (previousStage) {
                this.setClientStage(phone, previousStage) // Set the previous stage as the current stage
                this.enviarMensagem(message, "Voltando para o estágio anterior.");
            } else {
                this.enviarMensagem(message, "Não é possível voltar mais.");
            }
            return;
        }
    }

    async start_chatbot_Groundon() {

        //! Variáveis GLOBAIS
        const menu_principal = this.Widgets.menuPrincipal;
        const menu_formaPagamento = this.Widgets.menuPagamento;
        let ID_PEDIDO = ''
        let KYOGRE_LINK_ID = ''

        //!EVENTO DE ESPERAR MENSAGENS DO WHATSAPP
        this.whatsapp.onMessage(async (message) => {

            console.log('\n\nGroundon esperando mensagens...')
            console.log(`\n\nMEWTWO LIGADO ${this.isNLPMode}`)

            //!Tratamento quanto nao esta ligado

            //!Configurações de Conversa
            this.armazenarConversa(message);
            console.log(this.conversa)
            console.log(`Mensagem recebida: ${message.body}`)
            //this.mewTwo.salvarConversaEmCSV()

            //! Configurações de Estagios de Fluxo
            const phoneNumber = message.from;
            console.log('Novo telefone detectado!', phoneNumber,)

            // Inicializa o estado do cliente se não existir
            if (!this.clientStates[phoneNumber]) {
                this.clientStates[phoneNumber] = {
                    stack: [1] // Começa no estágio 1
                };
            }
            console.log('\n\n\n==================================================')
            console.log('Cliente Fazendo atendimento :\n', this.clientStates)
            console.log('==================================================\n\n\n')

            let numero_estagio
            numero_estagio = this.clientStates[phoneNumber].stack[this.clientStates[phoneNumber].stack.length - 1];


            //!Configurações Backend
            this.restartChatbot()
            try {
                this.resetEstagio(message, numero_estagio, pnhoneNumber) // Função que reseta os estagios

            } catch (error) {
                console.log('nao vai dar para voltar de estagio')
            }

            //! Configurações de IA
            if (this.isNLPMode) {
                if (message.body.toLowerCase() === '!sair') {
                    this.isNLPMode = false;

                    try {
                        this.mewTwo.salvarConversaEmCSV();

                    } catch (error) {
                        console.log('Erro ao salvar conversa em CSV', error);
                    }

                    this.enviarMensagem(message, 'Você saiu do modo de NLP e voltou ao chatbot padrão.');
                } else {
                    this.mewtwoRespondeMensagem(message);
                    return;
                }
            } else {
                if (message.body === '!startIA') {
                    this.start_chatbot_IA(message);

                } else {
                    // ... [existing logic to process message with the standard chatbot]

                    //this.mewtwoRespondeMensagem(message);


                    //! ===================== Estágio 1 - Apresentação =====================
                    if (numero_estagio === 1) {
                        console.log(`\n\n\nEstágio ${numero_estagio}:`, message.body);
                        console.log(typeof (message.body))

                        await this.delay(1000).then(
                            this.enviarMensagem(message, `Bem-vindo a Lanchonete!\n🤖 Eu sou o Robô Groundon e estou aqui para ajudar seu atendimento.`)
                        )
                        this.clientStates[phoneNumber].stack.push(2);
                        await this.delay(3000).then(
                            this.enviarMensagem(message, "🤖 Antes de começarmos, por favor, *Digite Seu Nome:*")
                        )


                    }
                    //!=====================  Estágio 2 - Mostrar Menu Principal =====================
                    else if (numero_estagio === 2) {
                        console.log(`\n\n\nEstágio ${numero_estagio}:`, message.body);

                        const iniciandoAtendimentoPeloTelefone = async () => {

                            if (!phoneNumber) {
                                console.error('Error - phoneNumber is undefined or null');
                                return;
                            }

                            if (!this.clientStates[phoneNumber]) {
                                this.clientStates[phoneNumber] = {
                                    stack: [2],  // If it's initializing at stage 2, then the stack should start with 2.
                                    cliente: new Cliente()
                                };

                                // Defina o cliente para MewTwo
                                this.mewTwo.setClient(this.clientStates[phoneNumber].cliente);

                            }

                            if (!this.clientStates[phoneNumber].cliente) {
                                console.log('\nNovo Cliente detectado!');
                                this.clientStates[phoneNumber].cliente = new Cliente();
                            }


                            try {
                                const nomeCLiente = this.getLastMessage(message);
                                const numCliente = this.estagio2.getTelefoneCliente(message);
                                ID_PEDIDO = this.backendController.gerarIdPedido();

                                // Set values
                                this.clientStates[phoneNumber].cliente.setNome(nomeCLiente);
                                this.clientStates[phoneNumber].cliente.setTelefone(numCliente);
                                this.clientStates[phoneNumber].cliente.setId(ID_PEDIDO);


                                // Incrementa o contador de pedidos para o número de telefone
                                this.incrementOrderCount(numCliente);


                                //Enviando dados para o backEnd
                                await this.backendController.enviarDadosClienteServidor(this.clientStates[phoneNumber].cliente, ID_PEDIDO);
                                KYOGRE_LINK_ID = await this.backendController.enviarLinkServidor(ID_PEDIDO);

                                console.log('\n\nDados Coletados!')
                                console.log(this.clientStates[phoneNumber].cliente);


                            } catch (error) {
                                console.log('Não foi possível fazer uma conexão no backend', error);
                            }
                        }
                        await iniciandoAtendimentoPeloTelefone()

                        await this.delay(2000).then(
                            //TODO se cliente não existir, cadastrar cliente

                            //TODO se cliente existir, pegar dados do cliente

                            await this.enviarMensagem(message, `✅ Prazer em te conhecer, ${this.clientStates[phoneNumber].cliente.getNome()}!`)
                        )

                        this.enviarMensagem(message, `Seu numero de pedido é #${ID_PEDIDO}`)

                        // Mostra o menu principal
                        let menu_principal_text = this.Widgets.getMenuText('Menu Principal', menu_principal);
                        this.enviarMensagem(message, menu_principal_text)


                        // this.enviarMensagem(message, `*${this.clientStates[phoneNumber].cliente.getNome()}*, agora temos uma nova funcionalidade de IA!\n\nDigite *!startIA* para conversar com o nosso modelo NLP!`)

                        this.clientStates[phoneNumber].stack.push(3);
                    }

                    //!=====================  Estágio 3 - Responde as funcionalidades do Botão =====================
                    else if (numero_estagio === 3) {
                        console.log(`\n\n\nEstágio ${numero_estagio}:`, message.body);

                        let cardapioEnviado = false;
                        let intent_escolhida;
                        const selectedOption = this.Widgets.getSelectedOption(menu_principal, message.body);

                        if (selectedOption) {
                            intent_escolhida = selectedOption.button.text.slice(3);
                            this.enviarMensagem(message, `Voce escolheu a opção *${intent_escolhida}*`)
                        } else {
                            intent_escolhida = this.getLastMessage(message)
                        }

                        // Processa a entrada usando MewTwo
                        const resposta_intent = await this.mewTwo.processIntent(intent_escolhida);
                        const cleanIntent = resposta_intent.intent.trim().replace(/"/g, '');
                        const resposta = this.mewTwo.getResponseForIntent(cleanIntent);


                        if (cleanIntent === 'pedido') {
                            this.enviarMensagem(message, resposta);

                            let cardapioEnviado = false

                            new Promise(async (resolve, reject) => {
                                try {
                                    const result = await this.sendLinkCardapioDigital(message, KYOGRE_LINK_ID);
                                    cardapioEnviado = true
                                    resolve(result);
                                }
                                catch (error) {
                                    reject(error);
                                }
                            }).then(() => {
                                this.clientStates[phoneNumber].stack.push(4);
                                console.log('Enviado?', cardapioEnviado)

                            }).catch((error) => {
                                console.error('Erro ao enviar o link do cardápio:', error);
                            });

                        } else {
                            this.delay(3000).then(
                                await this.enviarMensagem(message, `Resp. Mewtwo: ${resposta}`)
                            )

                            // enviar o menu se ele quer fazer o pedido
                            if (cleanIntent != 'pedido') {
                                this.delay(60000).then(() => {
                                    // Mostra o menu principal
                                    this.enviarMensagem(message, "Aqui tem mais opções no que posso te ajudar :)")
                                    let menu_principal_text = this.Widgets.getMenuText('Menu Principal', menu_principal)
                                    this.enviarMensagem(message, menu_principal_text)
                                })
                            }

                        }
                    }
                }}

                  });


    }

}

module.exports = StagesView;




/*
1 - boas vindas 
2- Pega o nome com cliente com o metodo do Groundon.getLastMessage() e salva no Cliente.nome
3- Aparece o menu principal onde a pessoa escolhe (Ver cardapio, Fazer Pedido, Ver localização)
4- O cliente faz a escolha e recebe a resposta
5- Ao fazer Pedido, aparece o Menu de Produtos onde o cliente escolhe qual Produto ele quer (comida, bebida, sobremesa, salgados, pizzas)
6 - O cliente escolhe o tipo de produto e recebe seu Cardapio
7 - O cliente faz o pedido e o Pedido é adicionado ao carrinho
8 - Aparece o MenuNavegacao onde o cliente escolhe se ele quer, [Continuar pedido, Ver Carrinho, Refazer Pedido, Finalizar Pedido]
9 - O cliente faz a sua escolha e recebe a resposta apropriada
10 - Se o cliente finaliza o pedido, ele vai para o Menu Pagamento onde ele escolhe [Cartao, Dinheiro, Pix)
11 - Menu de confirmacao Voce confirma? __forma_pagamento -> [Sim, Nao]
12 - O bot groundon pergunta o endereço de entrega
13 - O cliente responde o endereço
14 - O bot salva o endereço  no Cliente.endereco_entrega
15 - Aparece o MenuResumoPedido do Pedido e diz que o pedido foi enviado para o atendente e cospe o pedido em formato .json

*/