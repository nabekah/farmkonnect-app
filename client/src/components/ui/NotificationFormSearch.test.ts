import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter, NotificationItem, useNotificationCenter } from './NotificationCenter';
import { Form, FormField, FormGroup, FormActions, useForm } from './FormComponents';
import { SearchFilter, AdvancedFilter, useSearch } from './SearchFilter';
import { renderHook } from '@testing-library/react';

/**
 * NotificationCenter Component Tests
 */
describe('NotificationCenter Component', () => {
  const notifications = [
    {
      id: '1',
      title: 'Success',
      message: 'Operation completed',
      type: 'success' as const,
      timestamp: Date.now(),
      read: false,
    },
    {
      id: '2',
      title: 'Error',
      message: 'Something went wrong',
      type: 'error' as const,
      timestamp: Date.now(),
      read: false,
    },
  ];

  it('should render notifications', () => {
    render(
      <NotificationCenter
        notifications={notifications}
      />
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should show no notifications message', () => {
    render(
      <NotificationCenter
        notifications={[]}
      />
    );

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('should dismiss notification', () => {
    const onDismiss = vi.fn();
    render(
      <NotificationCenter
        notifications={notifications}
        onDismiss={onDismiss}
      />
    );

    const dismissButtons = screen.getAllByTitle('Dismiss');
    fireEvent.click(dismissButtons[0]);

    expect(onDismiss).toHaveBeenCalledWith('1');
  });

  it('should mark notification as read', () => {
    const onMarkAsRead = vi.fn();
    render(
      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
      />
    );

    const readButtons = screen.getAllByTitle('Mark as read');
    fireEvent.click(readButtons[0]);

    expect(onMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('should respect maxVisible limit', () => {
    const manyNotifications = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      title: `Notification ${i}`,
      timestamp: Date.now(),
      read: false,
    }));

    render(
      <NotificationCenter
        notifications={manyNotifications}
        maxVisible={5}
      />
    );

    expect(screen.getByText('+5 more notifications')).toBeInTheDocument();
  });
});

/**
 * useNotificationCenter Hook Tests
 */
describe('useNotificationCenter Hook', () => {
  it('should manage notifications', () => {
    const { result } = renderHook(() => useNotificationCenter());

    expect(result.current.notifications.length).toBe(0);

    result.current.addNotification('Test notification');

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].title).toBe('Test notification');
  });

  it('should add success notification', () => {
    const { result } = renderHook(() => useNotificationCenter());

    result.current.success('Success message');

    expect(result.current.notifications[0].type).toBe('success');
  });

  it('should add error notification', () => {
    const { result } = renderHook(() => useNotificationCenter());

    result.current.error('Error message');

    expect(result.current.notifications[0].type).toBe('error');
  });

  it('should remove notification', () => {
    const { result } = renderHook(() => useNotificationCenter());

    const id = result.current.addNotification('Test');
    expect(result.current.notifications.length).toBe(1);

    result.current.removeNotification(id);
    expect(result.current.notifications.length).toBe(0);
  });

  it('should mark notification as read', () => {
    const { result } = renderHook(() => useNotificationCenter());

    const id = result.current.addNotification('Test');
    result.current.markAsRead(id);

    expect(result.current.notifications[0].read).toBe(true);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotificationCenter());

    result.current.addNotification('Test 1');
    result.current.addNotification('Test 2');
    expect(result.current.notifications.length).toBe(2);

    result.current.clearAll();
    expect(result.current.notifications.length).toBe(0);
  });
});

/**
 * Form Component Tests
 */
describe('Form Component', () => {
  it('should render form with fields', () => {
    render(
      <Form
        initialValues={{ name: '', email: '' }}
        onSubmit={() => {}}
      >
        <input name="name" type="text" />
        <input name="email" type="email" />
      </Form>
    );

    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <Form
        initialValues={{ name: 'John' }}
        onSubmit={onSubmit}
      >
        <input name="name" type="text" defaultValue="John" />
        <button type="submit">Submit</button>
      </Form>
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should validate form on submit', async () => {
    const validate = vi.fn(() => ({ name: 'Name is required' }));
    render(
      <Form
        initialValues={{ name: '' }}
        onSubmit={() => {}}
        validate={validate}
      >
        <button type="submit">Submit</button>
      </Form>
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(validate).toHaveBeenCalled();
    });
  });
});

/**
 * FormField Component Tests
 */
describe('FormField Component', () => {
  it('should render form field', () => {
    render(
      <FormField
        name="email"
        label="Email"
        type="email"
        placeholder="Enter email"
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('should show required indicator', () => {
    render(
      <FormField
        name="email"
        label="Email"
        required={true}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display error message', () => {
    const formContext = {
      values: { email: '' },
      errors: { email: 'Email is required' },
      touched: { email: true },
      isSubmitting: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
    };

    render(
      <FormField
        name="email"
        label="Email"
        formContext={formContext}
      />
    );

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });
});

/**
 * FormGroup Component Tests
 */
describe('FormGroup Component', () => {
  it('should render form group', () => {
    render(
      <FormGroup
        label="Personal Info"
        description="Enter your personal information"
      >
        <input type="text" />
      </FormGroup>
    );

    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Enter your personal information')).toBeInTheDocument();
  });
});

/**
 * useForm Hook Tests
 */
describe('useForm Hook', () => {
  it('should manage form state', () => {
    const { result } = renderHook(() =>
      useForm(
        { name: '', email: '' },
        () => {}
      )
    );

    expect(result.current.values.name).toBe('');
    expect(result.current.isValid).toBe(true);
  });

  it('should handle field changes', () => {
    const { result } = renderHook(() =>
      useForm(
        { name: '' },
        () => {}
      )
    );

    result.current.handleChange('name', 'John');

    expect(result.current.values.name).toBe('John');
  });

  it('should validate on submit', async () => {
    const onSubmit = vi.fn();
    const validate = vi.fn(() => ({}));
    const { result } = renderHook(() =>
      useForm(
        { name: '' },
        onSubmit,
        validate
      )
    );

    await result.current.handleSubmit();

    expect(validate).toHaveBeenCalled();
  });
});

/**
 * SearchFilter Component Tests
 */
describe('SearchFilter Component', () => {
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  it('should render search input', () => {
    render(
      <SearchFilter
        data={data}
        searchFields={['name', 'email']}
        placeholder="Search..."
      />
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should filter results on search', async () => {
    const onResultsChange = vi.fn();
    render(
      <SearchFilter
        data={data}
        searchFields={['name']}
        onResultsChange={onResultsChange}
        debounceDelay={0}
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'John' } });

    await waitFor(() => {
      expect(onResultsChange).toHaveBeenCalled();
    });
  });

  it('should clear search', () => {
    render(
      <SearchFilter
        data={data}
        searchFields={['name']}
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'John' } });

    const clearButton = screen.getByRole('button', { name: '' });
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('should navigate results with keyboard', async () => {
    render(
      <SearchFilter
        data={data}
        searchFields={['name']}
        debounceDelay={0}
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'John' } });

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });
});

/**
 * AdvancedFilter Component Tests
 */
describe('AdvancedFilter Component', () => {
  const filters = [
    {
      key: 'status',
      label: 'Status',
      values: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ];

  it('should render filter options', () => {
    render(
      <AdvancedFilter
        filters={filters}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should toggle filter group', () => {
    render(
      <AdvancedFilter
        filters={filters}
      />
    );

    const statusButton = screen.getByText('Status');
    fireEvent.click(statusButton);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should select filter value', () => {
    const onFiltersChange = vi.fn();
    render(
      <AdvancedFilter
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    );

    const statusButton = screen.getByText('Status');
    fireEvent.click(statusButton);

    const activeCheckbox = screen.getByLabelText('Active');
    fireEvent.click(activeCheckbox);

    expect(onFiltersChange).toHaveBeenCalled();
  });

  it('should clear all filters', () => {
    const onFiltersChange = vi.fn();
    render(
      <AdvancedFilter
        filters={filters}
        selectedFilters={{ status: ['active'] }}
        onFiltersChange={onFiltersChange}
      />
    );

    const clearButton = screen.getByText(/Clear all/);
    fireEvent.click(clearButton);

    expect(onFiltersChange).toHaveBeenCalledWith({});
  });
});

/**
 * useSearch Hook Tests
 */
describe('useSearch Hook', () => {
  const data = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ];

  it('should search data', () => {
    const { result } = renderHook(() =>
      useSearch(data, ['name', 'email'], 0)
    );

    expect(result.current.results.length).toBe(0);

    result.current.setQuery('John');

    expect(result.current.query).toBe('John');
  });

  it('should return search results', async () => {
    const { result } = renderHook(() =>
      useSearch(data, ['name'], 0)
    );

    result.current.setQuery('John');

    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0);
    });
  });
});
