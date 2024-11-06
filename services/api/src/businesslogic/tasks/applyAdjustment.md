Agora eu quero construir uma função para atualizar o valor do aluguel e de outras despesas de cada período (term) do contrato, a partir de uma data base inserida pelo usuário. É como se fosse uma atualização monetária. O usuário deve inserir além da data base, uma descrição e o percentual de ajuste. Essas informações serão persistidas para que se aplique atualizações cumulativas, mas sempre utilizando o valor do aluguel original como base. Me ajude nesse problema. A função também deve retornar "rent" no mesmo padrão da anterior

Para implementar uma função que aplique ajustes cumulativos aos valores de aluguel e despesas extras de cada período, você pode seguir o mesmo padrão da função taskBase e expandi-la para incluir um novo ajuste monetário com base no valor original de aluguel e despesas. A função também precisa aplicar os ajustes de forma acumulativa e armazenar as informações para uso futuro.

## Explicação
### Data de Base e Fator de Ajuste:

A função recebe uma baseDate, uma adjustmentDescription e um adjustmentPercentage para calcular o novo valor ajustado do aluguel e das despesas.
A adjustmentFactor é calculada com base no percentual inserido, aplicando o ajuste cumulativo.


### Termos e Data:

Atualiza o termo (rent.term) e o mês e ano, conforme a frequência do contrato.

### Aplicação do Ajuste:

Filtra as propriedades do contrato dentro do intervalo de vigência e aplica o ajuste ao valor original do aluguel e das despesas (ajustadas multiplicando pelo adjustmentFactor).
As descrições dos itens ajustados incluem uma referência à descrição do ajuste.

### Retorno:

A função retorna rent no mesmo formato da função anterior.
Esse código permite que você aplique atualizações sucessivas ao aluguel e às despesas de cada período, mantendo o valor original como base para calcular os ajustes cumulativos. As descrições de cada ajuste são adicionadas para facilitar o rastreamento das mudanças.