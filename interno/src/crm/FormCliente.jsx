import { useAuth } from '../auth/AuthProvider.jsx';
import { useApoio } from '../componentes/Apoio.jsx';
import {
  AcoesDoFormulario, AreaTexto, Campo, Entrada, Erro, MaisDetalhes, Modal, Selecao,
} from '../componentes/Basicos.jsx';
import { STATUS_CLIENTE } from '../lib/constantes.js';
import { excluirCliente, salvarCliente } from '../lib/dados.js';
import { textoOuNulo } from '../lib/formato.js';
import { useCampos, useEnvio } from '../lib/useEnvio.js';

// Lista de opções que nunca perde o valor já gravado (mesmo se ele saiu da lista)
function comAtual(opcoes, atual) {
  return [...new Set([...opcoes, atual].filter(Boolean))];
}

// cliente = null para cadastrar
export default function FormCliente({ cliente, aoFechar, aoSalvar, aoExcluir }) {
  const { membro, ehGestao } = useAuth();
  const { membros, opcoes } = useApoio();
  const envio = useEnvio();

  const [f, mudar] = useCampos({
    empresa: cliente?.empresa || '',
    status: cliente?.status || 'Prospect',
    responsavel_id: cliente ? cliente.responsavel_id || '' : membro.id,
    segmento: cliente?.segmento || '',
    porte: cliente?.porte || '',
    cidade: cliente?.cidade || '',
    origem: cliente?.origem || '',
    documento: cliente?.documento || '',
    pasta_drive: cliente?.pasta_drive || '',
    observacoes: cliente?.observacoes || '',
  });

  const responsaveis = membros.filter((m) => m.ativo || m.id === f.responsavel_id);

  const aoEnviar = (evento) => {
    evento.preventDefault();
    envio.enviar(async () => {
      const salvo = await salvarCliente(
        cliente?.id,
        {
          empresa: f.empresa.trim(),
          status: f.status,
          responsavel_id: f.responsavel_id || null,
          segmento: textoOuNulo(f.segmento),
          porte: textoOuNulo(f.porte),
          cidade: textoOuNulo(f.cidade),
          origem: textoOuNulo(f.origem),
          pasta_drive: textoOuNulo(f.pasta_drive),
          observacoes: textoOuNulo(f.observacoes),
        },
        textoOuNulo(f.documento),
        ehGestao,
      );
      aoSalvar(salvo);
    });
  };

  const excluir = () => {
    if (!window.confirm(`Excluir o cliente "${cliente.empresa}" e os contatos dele? Não dá para desfazer.`)) return;
    envio.enviar(async () => {
      await excluirCliente(cliente.id);
      aoExcluir();
    });
  };

  return (
    <Modal titulo={cliente ? cliente.empresa : 'Novo cliente'} rotulo={cliente ? 'Cliente' : 'CRM'} aoFechar={aoFechar}>
      <form className="grid gap-4" onSubmit={aoEnviar}>
        <Campo rotulo="Empresa" obrigatorio>
          <Entrada required autoFocus={!cliente} value={f.empresa} onChange={mudar('empresa')} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Status">
            <Selecao value={f.status} onChange={mudar('status')} opcoes={STATUS_CLIENTE} />
          </Campo>
          <Campo rotulo="Responsável">
            <Selecao
              disabled={!ehGestao}
              value={f.responsavel_id}
              onChange={mudar('responsavel_id')}
              vazio="Sem responsável"
              opcoes={responsaveis.map((m) => ({ id: m.id, nome: m.nome }))}
            />
          </Campo>
        </div>

        <MaisDetalhes>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Segmento">
              <Selecao value={f.segmento} onChange={mudar('segmento')} vazio="Não definido" opcoes={comAtual(opcoes('segmento'), f.segmento)} />
            </Campo>
            <Campo rotulo="Porte">
              <Selecao value={f.porte} onChange={mudar('porte')} vazio="Não definido" opcoes={comAtual(opcoes('porte'), f.porte)} />
            </Campo>
            <Campo rotulo="Cidade">
              <Entrada value={f.cidade} onChange={mudar('cidade')} />
            </Campo>
            <Campo rotulo="Origem">
              <Selecao value={f.origem} onChange={mudar('origem')} vazio="Não definida" opcoes={comAtual(opcoes('origem'), f.origem)} />
            </Campo>
          </div>
          {ehGestao && (
            <Campo rotulo="CPF ou CNPJ" dica="Só a gestão vê este campo.">
              <Entrada value={f.documento} onChange={mudar('documento')} />
            </Campo>
          )}
          <Campo
            rotulo="Link da pasta no Drive"
            dica="Estrutura padrão: 01 Comercial · 02 Proposta e Contrato · 03 Handoff · 04 Projeto · 05 Encerramento"
          >
            <Entrada
              type="url"
              pattern="https://.*"
              title="O link precisa começar com https://"
              value={f.pasta_drive}
              onChange={mudar('pasta_drive')}
              placeholder="https://drive.google.com/…"
            />
          </Campo>
          <Campo rotulo="Observações">
            <AreaTexto value={f.observacoes} onChange={mudar('observacoes')} />
          </Campo>
        </MaisDetalhes>

        <Erro>{envio.erro}</Erro>
        <AcoesDoFormulario
          salvando={envio.salvando}
          aoCancelar={aoFechar}
          aoExcluir={cliente && ehGestao && aoExcluir ? excluir : null}
        />
      </form>
    </Modal>
  );
}
