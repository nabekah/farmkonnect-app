import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Tooltip, TooltipGroup } from './Tooltip';
import { InputValidation, TextareaValidation, ValidationRules } from './InputValidation';
import {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  ListSkeleton,
  GridSkeleton,
  ProfileSkeleton,
  ChatSkeleton,
} from './SkeletonVariants';

/**
 * Tooltip Component Tests
 */
describe('Tooltip Component', () => {
  it('should render tooltip on hover', async () => {
    render(
      <Tooltip content="Help text" trigger="hover">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button.parentElement!);

    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
  });

  it('should hide tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Help text" trigger="hover">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button.parentElement!);

    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(button.parentElement!);

    await waitFor(() => {
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    }, { timeout: 100 });
  });

  it('should show tooltip on click', async () => {
    render(
      <Tooltip content="Help text" trigger="click">
        <button>Click me</button>
      </Tooltip>
    );

    const button = screen.getByText('Click me');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
  });

  it('should toggle tooltip on click', async () => {
    render(
      <Tooltip content="Help text" trigger="click">
        <button>Click me</button>
      </Tooltip>
    );

    const button = screen.getByText('Click me');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    });
  });

  it('should show tooltip on focus', async () => {
    render(
      <Tooltip content="Help text" trigger="focus">
        <input type="text" />
      </Tooltip>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
  });

  it('should hide tooltip on blur', async () => {
    render(
      <Tooltip content="Help text" trigger="focus">
        <input type="text" />
      </Tooltip>
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });

    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    }, { timeout: 100 });
  });

  it('should respect delayShow', async () => {
    render(
      <Tooltip content="Help text" trigger="hover" delayShow={500}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button.parentElement!);

    // Should not appear immediately
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();

    // Should appear after delay
    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeInTheDocument();
    }, { timeout: 600 });
  });

  it('should not show when disabled', async () => {
    render(
      <Tooltip content="Help text" trigger="hover" disabled>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button.parentElement!);

    await waitFor(() => {
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    }, { timeout: 300 });
  });

  it('should have correct ARIA role', () => {
    const { container } = render(
      <Tooltip content="Help text" trigger="hover">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button.parentElement!);

    const tooltip = container.querySelector('[role="tooltip"]');
    expect(tooltip).toBeInTheDocument();
  });
});

/**
 * InputValidation Component Tests
 */
describe('InputValidation Component', () => {
  it('should render input with label', () => {
    render(
      <InputValidation label="Email" />
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should show required indicator', () => {
    render(
      <InputValidation label="Email" required />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should validate on blur', async () => {
    render(
      <InputValidation
        label="Email"
        rules={[ValidationRules.email()]}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should show success state', async () => {
    render(
      <InputValidation
        label="Email"
        rules={[ValidationRules.email()]}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.blur(input);

    await waitFor(() => {
      const wrapper = input.parentElement;
      expect(wrapper?.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('should call onValidationChange callback', async () => {
    const onValidationChange = vi.fn();
    render(
      <InputValidation
        label="Email"
        rules={[ValidationRules.email()]}
        onValidationChange={onValidationChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  it('should validate with multiple rules', async () => {
    render(
      <InputValidation
        label="Password"
        rules={[
          ValidationRules.minLength(8),
          ValidationRules.strongPassword(),
        ]}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'weak' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Minimum 8 characters required')).toBeInTheDocument();
    });
  });
});

/**
 * TextareaValidation Component Tests
 */
describe('TextareaValidation Component', () => {
  it('should render textarea with label', () => {
    render(
      <TextareaValidation label="Description" />
    );
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should validate on blur', async () => {
    render(
      <TextareaValidation
        label="Description"
        rules={[ValidationRules.minLength(10)]}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'short' } });
    fireEvent.blur(textarea);

    await waitFor(() => {
      expect(screen.getByText('Minimum 10 characters required')).toBeInTheDocument();
    });
  });
});

/**
 * ValidationRules Tests
 */
describe('ValidationRules', () => {
  it('should validate required rule', () => {
    const rule = ValidationRules.required();
    expect(rule.validate('text')).toBe(true);
    expect(rule.validate('')).toBe(false);
  });

  it('should validate email rule', () => {
    const rule = ValidationRules.email();
    expect(rule.validate('test@example.com')).toBe(true);
    expect(rule.validate('invalid')).toBe(false);
  });

  it('should validate minLength rule', () => {
    const rule = ValidationRules.minLength(5);
    expect(rule.validate('hello')).toBe(true);
    expect(rule.validate('hi')).toBe(false);
  });

  it('should validate maxLength rule', () => {
    const rule = ValidationRules.maxLength(5);
    expect(rule.validate('hello')).toBe(true);
    expect(rule.validate('toolong')).toBe(false);
  });

  it('should validate numeric rule', () => {
    const rule = ValidationRules.numeric();
    expect(rule.validate('123')).toBe(true);
    expect(rule.validate('12.5')).toBe(true);
    expect(rule.validate('abc')).toBe(false);
  });

  it('should validate phone rule', () => {
    const rule = ValidationRules.phone();
    expect(rule.validate('+1 (555) 123-4567')).toBe(true);
    expect(rule.validate('123')).toBe(false);
  });

  it('should validate URL rule', () => {
    const rule = ValidationRules.url();
    expect(rule.validate('https://example.com')).toBe(true);
    expect(rule.validate('invalid')).toBe(false);
  });

  it('should validate strong password rule', () => {
    const rule = ValidationRules.strongPassword();
    expect(rule.validate('StrongPass123!')).toBe(true);
    expect(rule.validate('weak')).toBe(false);
  });
});

/**
 * Skeleton Component Tests
 */
describe('Skeleton Component', () => {
  it('should render skeleton with default styles', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should apply custom width and height', () => {
    const { container } = render(<Skeleton width={100} height={50} />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.width).toBe('100px');
    expect(skeleton.style.height).toBe('50px');
  });

  it('should apply rounded classes', () => {
    const { container } = render(<Skeleton rounded="full" />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('rounded-full');
  });
});

/**
 * CardSkeleton Component Tests
 */
describe('CardSkeleton Component', () => {
  it('should render card skeleton with image', () => {
    const { container } = render(<CardSkeleton showImage />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render specified number of lines', () => {
    const { container } = render(<CardSkeleton lines={5} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });
});

/**
 * TableSkeleton Component Tests
 */
describe('TableSkeleton Component', () => {
  it('should render table skeleton with header', () => {
    const { container } = render(<TableSkeleton showHeader />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render specified number of rows and columns', () => {
    const { container } = render(<TableSkeleton rows={3} columns={4} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(12);
  });
});

/**
 * FormSkeleton Component Tests
 */
describe('FormSkeleton Component', () => {
  it('should render form skeleton with fields', () => {
    const { container } = render(<FormSkeleton fields={3} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render submit button', () => {
    const { container } = render(<FormSkeleton showButton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

/**
 * ListSkeleton Component Tests
 */
describe('ListSkeleton Component', () => {
  it('should render list skeleton with avatars', () => {
    const { container } = render(<ListSkeleton showAvatar />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render specified number of items', () => {
    const { container } = render(<ListSkeleton items={3} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});

/**
 * GridSkeleton Component Tests
 */
describe('GridSkeleton Component', () => {
  it('should render grid skeleton with items', () => {
    const { container } = render(<GridSkeleton items={6} columns={3} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should apply grid column layout', () => {
    const { container } = render(<GridSkeleton columns={2} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toContain('repeat(2');
  });
});

/**
 * ProfileSkeleton Component Tests
 */
describe('ProfileSkeleton Component', () => {
  it('should render profile skeleton with header image', () => {
    const { container } = render(<ProfileSkeleton showHeaderImage />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render profile skeleton without header image', () => {
    const { container } = render(<ProfileSkeleton showHeaderImage={false} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

/**
 * ChatSkeleton Component Tests
 */
describe('ChatSkeleton Component', () => {
  it('should render chat skeleton with messages', () => {
    const { container } = render(<ChatSkeleton messages={3} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should alternate message directions', () => {
    const { container } = render(<ChatSkeleton messages={2} />);
    const messageContainers = container.querySelectorAll('.flex');
    expect(messageContainers.length).toBeGreaterThan(0);
  });
});
