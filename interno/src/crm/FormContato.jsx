import {
  AcoesDoFormulario, Campo, Entrada, Erro, MaisDetalhes, Modal, Selecao,
} from '../componentes/Basicos.jsx';
import { buscarClientesResumo, excluirContato, salvarContato } from '../lib/dados.js';
import { aniversarioBR, aniversarioISO, textoOuNulo } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';
import { useCampos, useEnvio } from '../lib/useEnvio.js';

// Pessoa de contato dentro de um cliente. contato = null para cadastrar.
// clienteId fixa o cliente (quando aberto pela ficha do cliente).
export default function FormContato({ contato, clienteId, aoFechar, aoSalvar }) {
  const envio = useEnvio();
  const [f, mudar] = useCampos({
    nome: contato?.nome || '',
    cliente_id: contato?.cliente_id || clienteId || '',
    telefone: contato?.telefone || '',
    email: contato?.email || '',
    cargo: contato?.cargo || '',
    papel: contato?.papel || '',
    aniversario: aniversarioBR(contato?.aniversario),
  });

  const escolheCliente = !clienteId && !contato;
  const clientes = useConsulta(() => (escolheCliente ? buscarClientesResumo() : Promise.resolve([])), []);

  const aoEnviar = (evento) => {
    evento.preventDefault();
    const aniversario = aniversarioISO(f.aniversario);
    if (aniversario === undefined) {
      envio.setErro('Escreva o aniversário como dia/mês, por exemplo 05/09.');
      return;
    }
    envio.enviar(async () => {
      const salvo = await salvarContato(contato?.id, {
        nome: f.nome.trim(),
        cliente_id: f.cliente_id,
        telefone: textoOuNulo(f.telefone),
        email: textoOuNulo(f.email),
        cargo: textoOuNulo(f.cargo),
        papel: textoOuNulo(f.papel),
        aniversario,
      });
      aoSalvar(salvo);
    });
  };

  const aoExcluir = () => {
    if (!window.confirm(`Excluir o contato "${contato.nome}"?`)) return;
    envio.enviar(async () => {
      await excluirContato(contato.id);
      aoSalvar(null);
    });
  };

  return (
    <Modal titulo={contato ? contato.nome : 'Novo contato'} rotulo={contato ? 'Contato' : 'CRM'} aoFechar={aoFechar}>
      <form className="grid gap-4" onSubmit={aoEnviar}>
        <Campo rotulo="Nome" obrigatorio>
          <Entrada required autoFocus={!contato} value={f.nome} onChange={mudar('nome')} />
        </Campo>
        {escolheCliente && (
          <Campo rotulo="Cliente" obrigatorio>
            <Selecao
              required
              value={f.cliente_id}
              onChange={mudar('cliente_id')}
              vazio={clientes.carregando ? 'Carregando…' : 'Escolha'}
              opcoes={(clientes.dados || []).map((c) => ({ id: c.id, nome: c.empresa }))}
            />
          </Campo>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="WhatsApp">
            <Entrada type="tel" value={f.telefone} onChange={mudar('telefone')} placeholder="(11) 90000-0000" />
          </Campo>
          <Campo rotulo="E-mail">
            <Entrada type="email" value={f.email} onChange={mudar('email')} />
          </Campo>
        </div>

        <MaisDetalhes>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Cargo">
              <Entrada value={f.cargo} onChange={mudar('cargo')} />
            </Campo>
            <Campo rotulo="Papel na decisão">
              <Entrada value={f.papel} onChange={mudar('papel')} placeholder="Ex.: decide, influencia, usa" />
            </Campo>
          </div>
          <Campo rotulo="Aniversário (dia/mês)">
            <Entrada inputMode="numeric" value={f.aniversario} onChange={mudar('aniversario')} placeholder="dd/mm" />
          </Campo>
        </MaisDetalhes>

        <Erro>{envio.erro || clientes.erro}</Erro>
        <AcoesDoFormulario salvando={envio.salvando} aoCancelar={aoFechar} aoExcluir={contato ? aoExcluir : null} />
      </form>
    </Modal>
  );
}
