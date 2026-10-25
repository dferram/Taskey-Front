import { render, screen, fireEvent, act } from '@testing-library/react-native';
import AdminTareas from '../../app/(parent)/admintareas';
import { useTareasViewModel } from '../../viewmodels/useTareasViewModel';
import { useHijosViewModel } from '../../viewmodels/useHijosViewModel';
import { __resetMocks } from 'expo-router';

jest.mock('../../viewmodels/useTareasViewModel');
jest.mock('../../viewmodels/useHijosViewModel');

describe('<AdminTareas /> - verificacion de tareas', () => {
  beforeEach(() => {
    __resetMocks();
    useHijosViewModel.mockReturnValue({
      hijos: [{ id: 'child-1', nombre: 'Juanito' }],
      fetchHijos: jest.fn(),
    });
  });

  it('muestra el boton de verificar cuando la asignacion esta completed y lo manda a cambiarEstadoAsignacion', async () => {
    const cambiarEstadoAsignacion = jest.fn().mockResolvedValue({ success: true });
    useTareasViewModel.mockReturnValue({
      tareas: [
        {
          id: 't1',
          title: 'Tender la cama',
          description: 'desc',
          due_date: '2026-10-26',
          due_time: '18:00:00',
          reward_keys: 25,
          duration_hours: 0,
          duration_minutes: 10,
          assignments: [{ id: 'a1', child_id: 'child-1', status: 'completed' }],
        },
      ],
      fetchTareas: jest.fn(),
      eliminarTarea: jest.fn(),
      asignarTarea: jest.fn(),
      cambiarEstadoAsignacion,
      loading: false,
    });

    await render(<AdminTareas />);

    // Abrir el dropdown "Asignada a"
    await act(async () => {
      await fireEvent.press(screen.getByText('Asignada a'));
    });

    expect(screen.getByText('Juanito')).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByTestId('verify-a1'));
    });

    expect(cambiarEstadoAsignacion).toHaveBeenCalledWith('a1', 'verified');
  });

  it('no muestra el boton de verificar si la asignacion sigue pendiente', async () => {
    useTareasViewModel.mockReturnValue({
      tareas: [
        {
          id: 't1',
          title: 'Tender la cama',
          description: 'desc',
          due_date: '2026-10-26',
          due_time: '18:00:00',
          reward_keys: 25,
          duration_hours: 0,
          duration_minutes: 10,
          assignments: [{ id: 'a1', child_id: 'child-1', status: 'assigned' }],
        },
      ],
      fetchTareas: jest.fn(),
      eliminarTarea: jest.fn(),
      asignarTarea: jest.fn(),
      cambiarEstadoAsignacion: jest.fn(),
      loading: false,
    });

    await render(<AdminTareas />);

    await act(async () => {
      await fireEvent.press(screen.getByText('Asignada a'));
    });

    expect(screen.queryByTestId('verify-a1')).toBeNull();
  });
});
