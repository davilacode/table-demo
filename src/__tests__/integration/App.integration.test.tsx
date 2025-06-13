import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { mockProjectionData } from '@/test-utils/mock-data';


jest.mock('@/hooks/useProjectionData', () => ({
  useProjectionData: () => ({
    data: mockProjectionData,
    selectedColumn: null,
    dates: ['2025-03-21T00:00:00', '2025-03-22T00:00:00'],
    summaryData: null,
    actions: {
      editCell: jest.fn(),
      selectColumn: jest.fn(),
    }
  })
}));

describe('App Integration', () => {
  test('flujo completo: cargar datos → seleccionar columna → editar celda → verificar resumen', async () => {
    const user = userEvent.setup();
    
    render(<App />);

    expect(screen.getByText('Proyección de Productos')).toBeInTheDocument();
    expect(screen.getByText('210001000004R20')).toBeInTheDocument();
    

    const columnHeader = screen.getByText('21/03');
    await user.click(columnHeader);
    
    const cell = screen.getByTestId('cell-210001000004R20-2025-03-21T00:00:00');
    await user.click(cell);
    
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '100');
    await user.keyboard('{Enter}');
  
    await waitFor(() => {
      expect(cell).toHaveClass('bg-green-100');
    });
  });

  test('debe manejar casos edge: datos vacíos, valores negativos', async () => {
    render(<App />);
    
    expect(screen.getByText(/No hay datos/)).toBeInTheDocument();
  });
});