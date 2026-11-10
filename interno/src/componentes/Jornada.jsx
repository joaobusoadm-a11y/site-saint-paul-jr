import { JORNADA } from '../lib/constantes.js';

// Etapa do cliente na jornada, no grafismo "ponto a ponto" da marca:
// pontos que crescem da esquerda para a direita (12, 18 e 26px), ligados por um traço reto de 3px.
// Em petróleo, o caminho já percorrido; em cinza, o que falta.
export default function Jornada({ posicao }) {
  const ultima = JORNADA.length - 1;
  return (
    <ol className="flex" aria-label="Etapa atual da jornada do cliente">
      {JORNADA.map((etapa, i) => {
        const feita = i <= posicao;
        const tamanho = i === 0 ? 12 : i === ultima ? 26 : 18;
        return (
          <li key={etapa} className="relative flex min-w-0 flex-1 flex-col items-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-[11.5px] h-[3px] w-full ${feita ? 'bg-petroleo' : 'bg-linha'}`}
              />
            )}
            <span className="relative z-10 flex h-[26px] items-center">
              <span
                aria-hidden="true"
                className={`block rounded-full ${feita ? 'bg-petroleo' : 'bg-linha'}`}
                style={{ width: tamanho, height: tamanho }}
              />
            </span>
            {/* No celular não cabem os seis nomes: ficam o primeiro, o atual e o último */}
            <span
              className={`mt-2 px-1 text-center text-[13px] leading-tight sm:block sm:text-sm ${
                i === 0 || i === ultima || i === posicao ? 'block' : 'sr-only sm:not-sr-only'
              } ${i === posicao ? 'font-semibold text-preto' : 'text-suave'}`}
              aria-current={i === posicao ? 'step' : undefined}
            >
              {etapa}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
