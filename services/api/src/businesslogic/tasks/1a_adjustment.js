// TODO: NEED ALL REVIEW AND ADJUSTMENTS

import moment from 'moment';

export default function applyAdjustment(
  contract,
  baseDate,
  adjustmentDescription,
  adjustmentPercentage,
  rent
) {
  const adjustmentMoment = moment(baseDate, 'DD/MM/YYYY HH:mm');

  // Converter o percentual de ajuste em fator multiplicativo
  const adjustmentFactor = 1 + adjustmentPercentage / 100;

  // Atualizar o `rent.term` com base na data de ajuste e frequência do contrato
  rent.term = Number(adjustmentMoment.format('YYYYMMDDHH'));
  if (contract.frequency === 'months') {
    rent.term = Number(
      moment(adjustmentMoment).startOf('month').format('YYYYMMDDHH')
    );
  } else if (contract.frequency === 'days') {
    rent.term = Number(
      moment(adjustmentMoment).startOf('day').format('YYYYMMDDHH')
    );
  } else if (contract.frequency === 'hours') {
    rent.term = Number(
      moment(adjustmentMoment).startOf('hour').format('YYYYMMDDHH')
    );
  }

  // Definir o mês e o ano do período
  rent.month = adjustmentMoment.month() + 1; // Mês baseado em 0
  rent.year = adjustmentMoment.year();

  // Filtrar propriedades no intervalo de vigência do contrato e aplicar o ajuste
  contract.properties
    .filter((property) => {
      const entryMoment = moment(property.entryDate).startOf('day');
      const exitMoment = moment(property.exitDate).endOf('day');

      return adjustmentMoment.isBetween(
        entryMoment,
        exitMoment,
        contract.frequency,
        '[]'
      );
    })
    .forEach((property) => {
      if (property.property) {
        const name = property.property.name || '';
        const originalRent = property.rent || 0;
        const expenses = property.expenses || [];

        // Aplicar ajuste ao aluguel com base no valor original
        const adjustedRent = originalRent * adjustmentFactor;

        // Adicionar valor ajustado ao `preTaxAmounts`
        rent.preTaxAmounts.push({
          description: `${name} - Ajuste (${adjustmentDescription})`,
          amount: adjustedRent
        });

        // Ajustar despesas, se houver
        if (expenses.length) {
          rent.charges.push(
            ...expenses.map(({ title, amount }) => ({
              description: `${title} - Ajuste (${adjustmentDescription})`,
              amount: amount * adjustmentFactor
            }))
          );
        }
      }
    });

  // Caso o contrato tenha settlements (acordos adicionais)
  if (rent.settlements) {
    rent.description = rent.settlements.description || '';
  }

  return rent;
}
