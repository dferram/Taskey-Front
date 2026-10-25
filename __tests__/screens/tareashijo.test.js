import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import TareasHijo from '../../app/(child)/tareashijo';
import { useTareasHijoViewModel } from '../../viewmodels/useTareasHijoViewModel';
import { router, __resetMocks } from 'expo-router';

jest.mock('../../viewmodels/useTareasHijoViewModel');

function hoyISO(offsetDias = 0) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + offsetDias);
  return fecha.toISOString().slice(0, 10);
}

describe('<TareasHijo />', () => {
  beforeEach(() => {
    __resetMocks();
  });

  it('muestra las misiones de hoy obtenidas de la API, no datos de ejemplo', async () => {
    useTareasHijoViewModel.mockReturnValue({
      tareas: [
        {
          id: 't1',
          title: 'Tender la cama',
          description: 'Tender la cama y acomodar los peluches',
          due_date: hoyISO(0),
          due_time: '18:00:00',
          reward_keys: 25,
          duration_hours: 0,
          duration_minutes: 10,
          assignments: [{ id: 'a1', status: 'assigned' }],
        },
      ],
      loading: false,
      fetchTareas: jest.fn(),
    });

    await render(<TareasHijo />);

    expect(screen.getByText('Tender la cama')).toBeTruthy();
    expect(screen.getByText('Pendiente')).toBeTruthy();
    expect(screen.queryByText('Hacer ejercicio')).toBeNull(); // dato de ejemplo viejo, ya no debe existir
  });

  it('navega a detalletarea con el id de la asignacion al tocar una mision', async () => {
    useTareasHijoViewModel.mockReturnValue({
      tareas: [
        {
          id: 't1',
          title: 'Tender la cama',
          description: 'desc',
          due_date: hoyISO(0),
          due_time: null,
          reward_keys: 25,
          duration_hours: 0,
          duration_minutes: 10,
          assignments: [{ id: 'assignment-abc', status: 'in_progress' }],
        },
      ],
      loading: false,
      fetchTareas: jest.fn(),
    });

    await render(<TareasHijo />);

    fireEvent.press(screen.getByText('Tender la cama'));

    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/detalletarea',
        params: expect.objectContaining({ id: 'assignment-abc', status: 'in_progress' }),
      })
    );
  });

  it('marca como completadas las tareas verificadas o completadas', async () => {
    useTareasHijoViewModel.mockReturnValue({
      tareas: [
        {
          id: 't1',
          title: 'Estudiar matemáticas',
          description: 'desc',
          due_date: hoyISO(0),
          due_time: null,
          reward_keys: 40,
          duration_hours: 0,
          duration_minutes: 30,
          assignments: [{ id: 'a1', status: 'verified' }],
        },
      ],
      loading: false,
      fetchTareas: jest.fn(),
    });

    await render(<TareasHijo />);

    expect(screen.getByText('Completada')).toBeTruthy();
  });

  it('no deja la lista vacia por un error de fecha en una tarea', async () => {
    useTareasHijoViewModel.mockReturnValue({
      tareas: [
        {
          id: 't1',
          title: 'Tarea sin fecha',
          description: 'desc',
          due_date: null,
          due_time: null,
          reward_keys: 10,
          duration_hours: 0,
          duration_minutes: 5,
          assignments: [{ id: 'a1', status: 'assigned' }],
        },
      ],
      loading: false,
      fetchTareas: jest.fn(),
    });

    await render(<TareasHijo />);

    // Las tareas sin fecha caen en el dia de "hoy" (seleccionado por defecto)
    expect(screen.getByText('Tarea sin fecha')).toBeTruthy();
  });
});
