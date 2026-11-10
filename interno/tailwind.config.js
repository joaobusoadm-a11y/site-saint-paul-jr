// Cores, fontes e formas do manual de marca da Saint Paul Jr (Brand Book v1.0).
// Para mudar o visual do site inteiro, mude aqui.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        preto: '#191818',
        petroleo: {
          DEFAULT: '#184848',
          escuro: '#193B3D',
          claro: '#9FD3CB', // só sobre fundo escuro
          forte: '#0F3333', // botão principal com o mouse em cima
        },
        areia: '#F8F5E6',
        painel: '#F3F3F1',
        linha: '#D9D9D9',
        campo: '#8C8C8C', // borda de campo de formulário (a linha da marca é clara demais para isso)
        suave: '#3D3D3D',
        alerta: '#B3261E', // atrasado, erro e excluir (fora da paleta da marca)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        titulo: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
};
