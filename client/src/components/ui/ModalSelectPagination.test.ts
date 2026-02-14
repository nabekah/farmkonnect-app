import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal, Dialog, AlertDialog, useModal } from './Modal';
import { Select, MultiSelect } from './Select';
import { Pagination, PaginationInfo, PaginationControls, usePagination } from './Pagination';
import { renderHook } from '@testing-library/react';

/**
 * Modal Component Tests
 */
describe('Modal Component', () => {
  it('should render modal when isOpen is true', () => {
    render(
      <Modal
        title="Test Modal"
        isOpen={true}
        onClose={() => {}}
      >
        Modal content
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(
      <Modal
        title="Test Modal"
        isOpen={false}
        onClose={() => {}}
      >
        Modal content
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal
        title="Test Modal"
        isOpen={true}
        onClose={onClose}
        showCloseButton={true}
      >
        Modal content
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should close on escape key', async () => {
    const onClose = vi.fn();
    render(
      <Modal
        title="Test Modal"
        isOpen={true}
        onClose={onClose}
        closeOnEscape={true}
      >
        Modal content
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should close on backdrop click', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal
        title="Test Modal"
        isOpen={true}
        onClose={onClose}
        closeOnBackdropClick={true}
      >
        Modal content
      </Modal>
    );

    const backdrop = container.querySelector('[role="dialog"]')?.parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it('should render footer when provided', () => {
    render(
      <Modal
        title="Test Modal"
        isOpen={true}
        onClose={() => {}}
        footer={<button>Action</button>}
      >
        Modal content
      </Modal>
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    const { container } = render(
      <Modal
        title="Test Modal"
        isOpen={true}
        onClose={() => {}}
      >
        Modal content
      </Modal>
    );

    const modal = container.querySelector('[role="dialog"]');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});

/**
 * Dialog Component Tests
 */
describe('Dialog Component', () => {
  it('should render dialog when open is true', () => {
    render(
      <Dialog
        title="Test Dialog"
        open={true}
        onOpenChange={() => {}}
      >
        Dialog content
      </Dialog>
    );
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  it('should call onOpenChange when closed', () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog
        title="Test Dialog"
        open={true}
        onOpenChange={onOpenChange}
        showCloseButton={true}
      >
        Dialog content
      </Dialog>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

/**
 * AlertDialog Component Tests
 */
describe('AlertDialog Component', () => {
  it('should render alert dialog with title and description', () => {
    render(
      <AlertDialog
        title="Confirm Action"
        description="Are you sure?"
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should call onAction when action button clicked', () => {
    const onAction = vi.fn();
    render(
      <AlertDialog
        title="Confirm"
        isOpen={true}
        onClose={() => {}}
        onAction={onAction}
        actionLabel="Delete"
      />
    );

    const actionButton = screen.getByText('Delete');
    fireEvent.click(actionButton);
    expect(onAction).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(
      <AlertDialog
        title="Confirm"
        isOpen={true}
        onClose={() => {}}
        isLoading={true}
        actionLabel="Delete"
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

/**
 * useModal Hook Tests
 */
describe('useModal Hook', () => {
  it('should manage modal state', () => {
    const { result } = renderHook(() => useModal(false));

    expect(result.current.isOpen).toBe(false);

    result.current.open();
    expect(result.current.isOpen).toBe(true);

    result.current.close();
    expect(result.current.isOpen).toBe(false);

    result.current.toggle();
    expect(result.current.isOpen).toBe(true);
  });
});

/**
 * Select Component Tests
 */
describe('Select Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('should render select with placeholder', () => {
    render(
      <Select
        options={options}
        placeholder="Select an option"
      />
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should open dropdown on click', async () => {
    render(
      <Select
        options={options}
        placeholder="Select"
      />
    );

    const trigger = screen.getByText('Select');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  it('should select option on click', async () => {
    const onChange = vi.fn();
    render(
      <Select
        options={options}
        onChange={onChange}
        placeholder="Select"
      />
    );

    const trigger = screen.getByText('Select');
    fireEvent.click(trigger);

    await waitFor(() => {
      const option = screen.getByText('Option 1');
      fireEvent.click(option);
    });

    expect(onChange).toHaveBeenCalledWith('option1');
  });

  it('should filter options when searchable', async () => {
    render(
      <Select
        options={options}
        searchable={true}
        placeholder="Select"
      />
    );

    const trigger = screen.getByText('Select');
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Option 1' } });

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });
  });

  it('should navigate with keyboard', async () => {
    render(
      <Select
        options={options}
        placeholder="Select"
      />
    );

    const trigger = screen.getByText('Select');
    fireEvent.click(trigger);

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  it('should clear value when clearable', async () => {
    const onChange = vi.fn();
    render(
      <Select
        options={options}
        value="option1"
        onChange={onChange}
        clearable={true}
        placeholder="Select"
      />
    );

    const clearButton = screen.getByRole('button', { name: '' });
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });
});

/**
 * MultiSelect Component Tests
 */
describe('MultiSelect Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('should render multi-select with placeholder', () => {
    render(
      <MultiSelect
        options={options}
        placeholder="Select options"
      />
    );
    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  it('should select multiple options', async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        options={options}
        onChange={onChange}
        placeholder="Select"
      />
    );

    const trigger = screen.getByText('Select');
    fireEvent.click(trigger);

    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);

    expect(onChange).toHaveBeenCalledWith(['option1']);
  });

  it('should respect maxItems limit', async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        options={options}
        onChange={onChange}
        maxItems={2}
        placeholder="Select"
      />
    );

    const trigger = screen.getByText('Select');
    fireEvent.click(trigger);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

/**
 * Pagination Component Tests
 */
describe('Pagination Component', () => {
  it('should render pagination buttons', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should call onPageChange when page clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    const page2Button = screen.getByText('2');
    fireEvent.click(page2Button);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );

    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={() => {}}
      />
    );

    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  it('should show ellipsis for large page counts', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={20}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should highlight current page', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={() => {}}
      />
    );

    const currentPageButton = screen.getByText('2');
    expect(currentPageButton).toHaveClass('bg-primary');
  });
});

/**
 * PaginationInfo Component Tests
 */
describe('PaginationInfo Component', () => {
  it('should display correct pagination info', () => {
    render(
      <PaginationInfo
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
      />
    );

    expect(screen.getByText('Showing 1 to 10 of 50 items')).toBeInTheDocument();
  });

  it('should handle last page correctly', () => {
    render(
      <PaginationInfo
        currentPage={5}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
      />
    );

    expect(screen.getByText('Showing 41 to 50 of 50 items')).toBeInTheDocument();
  });
});

/**
 * PaginationControls Component Tests
 */
describe('PaginationControls Component', () => {
  it('should render pagination controls', () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        totalItems={50}
      />
    );

    expect(screen.getByLabelText('Items per page:')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 to 10 of 50 items')).toBeInTheDocument();
  });

  it('should change items per page', () => {
    const onItemsPerPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        onItemsPerPageChange={onItemsPerPageChange}
        itemsPerPage={10}
      />
    );

    const select = screen.getByDisplayValue('10');
    fireEvent.change(select, { target: { value: '25' } });

    expect(onItemsPerPageChange).toHaveBeenCalledWith(25);
  });
});

/**
 * usePagination Hook Tests
 */
describe('usePagination Hook', () => {
  it('should manage pagination state', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, initialItemsPerPage: 10 })
    );

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.itemsPerPage).toBe(10);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(10);
  });

  it('should handle page changes', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, initialItemsPerPage: 10 })
    );

    result.current.handlePageChange(3);

    expect(result.current.currentPage).toBe(3);
    expect(result.current.startIndex).toBe(20);
    expect(result.current.endIndex).toBe(30);
  });

  it('should handle items per page changes', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, initialItemsPerPage: 10 })
    );

    result.current.handleItemsPerPageChange(25);

    expect(result.current.itemsPerPage).toBe(25);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.currentPage).toBe(1);
  });
});
