// Datas em dd/mm/aaaa, valores em R$, telefones e links

// 'aaaa-mm-dd' (como o banco guarda) → 'dd/mm/aaaa'
export function dataBR(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

// Hoje em 'aaaa-mm-dd', no fuso do computador da pessoa
export function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Texto digitado → data. Aceita dd/mm (assume o ano atual), dd/mm/aa e dd/mm/aaaa.
// Devolve '' se vazio, 'aaaa-mm-dd' se válido e undefined se inválido.
export function dataISO(texto) {
  const numeros = (texto || '').replace(/\D/g, '');
  if (!numeros) return '';
  if (![4, 6, 8].includes(numeros.length)) return undefined;
  const dia = Number(numeros.slice(0, 2));
  const mes = Number(numeros.slice(2, 4));
  let ano = new Date().getFullYear();
  if (numeros.length === 6) ano = 2000 + Number(numeros.slice(4));
  if (numeros.length === 8) ano = Number(numeros.slice(4));
  const data = new Date(ano, mes - 1, dia);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return undefined;
  if (ano < 2000 || ano > 2100) return undefined;
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export function jaPassou(iso) {
  return Boolean(iso) && iso.slice(0, 10) < hojeISO();
}

// Aniversário: o banco guarda uma data no ano 2000; o site mostra e pede só 'dd/mm'
export function aniversarioBR(iso) {
  return iso ? dataBR(iso).slice(0, 5) : '';
}

// 'dd/mm' → '2000-mm-dd'. Devolve null se vazio e undefined se inválido.
export function aniversarioISO(texto) {
  const limpo = (texto || '').trim();
  if (!limpo) return null;
  const partes = limpo.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!partes) return undefined;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const data = new Date(2000, mes - 1, dia);
  if (data.getMonth() !== mes - 1 || data.getDate() !== dia) return undefined;
  return `2000-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function moeda(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  return formatoMoeda.format(Number(valor));
}

// '12.500,50' ou 'R$ 12500' → 12500.5. Devolve null se vazio e undefined se inválido.
export function numeroDeMoeda(texto) {
  const limpo = String(texto ?? '').replace(/[R$\s]/g, '');
  if (!limpo) return null;
  const numero = Number(limpo.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(numero) && numero >= 0 ? numero : undefined;
}

// Número para preencher o campo de valor: 12500.5 → '12.500,50'
export function moedaParaCampo(valor) {
  if (valor === null || valor === undefined) return '';
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Link do WhatsApp a partir do telefone digitado de qualquer jeito
export function linkWhatsApp(telefone, mensagem) {
  let numeros = (telefone || '').replace(/\D/g, '');
  if (numeros.length < 10) return null;
  if (numeros.length <= 11) numeros = `55${numeros}`; // sem DDI: assume Brasil
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : '';
  return `https://wa.me/${numeros}${texto}`;
}

// Só aceita link https (evita link malicioso gravado num campo)
export function linkSeguro(link) {
  return typeof link === 'string' && link.startsWith('https://') ? link : null;
}

// Texto digitado → valor para o banco (vazio vira null)
export function textoOuNulo(texto) {
  const limpo = (texto ?? '').trim();
  return limpo === '' ? null : limpo;
}

// Busca sem diferenciar maiúsculas e acentos
export function normalizar(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function contem(busca, ...campos) {
  const termo = normalizar(busca).trim();
  if (!termo) return true;
  return campos.some((campo) => normalizar(campo).includes(termo));
}

export function iniciais(nome) {
  const partes = (nome || '').trim().split(/\s+/);
  if (!partes[0]) return '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (partes[0][0] + ultima).toUpperCase();
}
