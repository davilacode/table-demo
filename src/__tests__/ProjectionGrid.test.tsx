import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectionGrid } from '@/components/projection/ProjectionGrid';
import { mockProjectionData } from '@/test-utils/mock-data';
import { processDataForTable } from '@/lib/color-calculator';

describe('ProjectionGrid', () => {

  const processedData = processDataForTable(mockProjectionData, new Map());

  const defaultProps = {
    data: processedData,
    dates: ['2025-03-21T00:00:00', '2025-03-22T00:00:00', '2025-03-23T00:00:00'],
    selectedColumn: null,
    onCellEdit: jest.fn(),
    onColumnSelect: jest.fn(),
  };

  test('debe renderizar la tabla con datos correctos', () => {
    render(<ProjectionGrid {...defaultProps} />);
    
    expect(screen.getByText('210001000004R20')).toBeInTheDocument();
    expect(screen.getByText('BCV')).toBeInTheDocument();
  });

  test('debe calcular colores correctamente según reglas de negocio', () => {
    render(<ProjectionGrid {...defaultProps} />);
    
    // Caso: NetFlow=100, MakeToOrder=23, RedZone=50, YellowZone=55, GreenZone=55
    // Total=123, debe ser verde (> RedZone + YellowZone = 105)
    const cell = screen.getByTestId('cell-210001000004R20-2025-03-21T00:00:00');
    expect(cell).toHaveClass('bg-blue-100');
  });

  test('debe permitir edición sin afectar celdas siguientes', async () => {
    const user = userEvent.setup();
    const onCellEdit = jest.fn();
    
    render(<ProjectionGrid {...defaultProps} onCellEdit={onCellEdit} />);
    
    const cell = screen.getByTestId('cell-210001000004R20-2025-03-21T00:00:00');
    await user.click(cell);
    
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '50');
    await user.keyboard('{Enter}');
    
    expect(onCellEdit).toHaveBeenCalledWith('210001000004R20-2025-03-21T00:00:00', 50);
    
    // Verificar que solo se afectó la celda editada
    const nextCell = screen.getByTestId('cell-210001000004R20-2025-03-22T00:00:00');
    expect(nextCell).not.toHaveClass('bg-red-100'); // No debe cambiar
  });

  test('debe actualizar color en tiempo real al editar', async () => {
    const user = userEvent.setup();
    
    render(<ProjectionGrid {...defaultProps} />);
    
    const cell = screen.getByTestId('cell-210001000004R20-2025-03-21T00:00:00');
    await user.click(cell);
    
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '-1500'); // Valor que resulta en zona roja
    
    await waitFor(() => {
      expect(cell).toHaveClass('bg-red-100');
    });
  });

  test('debe manejar selección de columna correctamente', async () => {
    const user = userEvent.setup();
    const onColumnSelect = jest.fn();
    
    render(<ProjectionGrid {...defaultProps} onColumnSelect={onColumnSelect} />);
    
    const columnHeader = screen.getByText('21/03');
    await user.click(columnHeader);
    
    expect(onColumnSelect).toHaveBeenCalledWith('2025-03-21T00:00:00');
  });
});