import * as React from 'react';
import {createPortal} from 'react-dom';
import {cn} from '@/utils/cn.ts';
import {Check, ChevronDown, Search, X} from 'lucide-react';

export interface SearchableSelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    clearAriaLabel?: string;
    usePortal?: boolean;
    portalTarget?: HTMLElement | null;
    menuZIndex?: number;
}

export const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(
    (
        {
            options,
            value,
            onChange,
            placeholder = 'Select an option',
            searchPlaceholder = 'Search...',
            emptyText = 'No options found',
            disabled,
            className,
            clearAriaLabel = 'Clear selection',
            usePortal = true,
            portalTarget,
            menuZIndex = 100,
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [query, setQuery] = React.useState('');
        const [highlightedIndex, setHighlightedIndex] = React.useState(0);

        const containerRef = React.useRef<HTMLDivElement>(null);
        const triggerRef = React.useRef<HTMLButtonElement>(null);
        const searchInputRef = React.useRef<HTMLInputElement>(null);
        const listRef = React.useRef<HTMLDivElement>(null);
        const menuRef = React.useRef<HTMLDivElement>(null);
        const [portalPosition, setPortalPosition] = React.useState<{ top: number; left: number; width: number }>({
            top: 0,
            left: 0,
            width: 0,
        });
        const [listMaxHeight, setListMaxHeight] = React.useState(200);
        const [menuPlacement, setMenuPlacement] = React.useState<'top' | 'bottom'>('bottom');
        const [detectedPortalTarget, setDetectedPortalTarget] = React.useState<HTMLElement | null>(null);

        // Auto-detect portal target (dialog/modal container) if not explicitly provided
        React.useEffect(() => {
            if (portalTarget || !containerRef.current) return;

            // Look for dialog, modal, or popover-like ancestors
            let ancestor: HTMLElement | null = containerRef.current;
            while (ancestor) {
                const role = ancestor.getAttribute('role');
                const ariaModal = ancestor.getAttribute('aria-modal');
                const dataRole = ancestor.getAttribute('data-radix-dialog-content');

                // Check for dialog, modal, or similar containers
                if (role === 'dialog' || ariaModal === 'true' || dataRole) {
                    setDetectedPortalTarget(ancestor);
                    return;
                }

                ancestor = ancestor.parentElement;
            }

            // Fallback to document.body if no dialog found
            if (typeof document !== 'undefined') {
                setDetectedPortalTarget(document.body);
            }
        }, [portalTarget]);

        const selectedOption = React.useMemo(
            () => options.find((opt) => opt.value === value),
            [options, value]
        );

        const filteredOptions = React.useMemo(() => {
            const normalizedQuery = query.trim().toLowerCase();
            if (!normalizedQuery) return options;
            return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
        }, [options, query]);

        React.useEffect(() => {
            if (!isOpen) return;
            const handleOutsideClick = (event: MouseEvent) => {
                const target = event.target as Node;
                const clickedTriggerArea = containerRef.current?.contains(target) ?? false;
                const clickedMenu = menuRef.current?.contains(target) ?? false;

                if (!clickedTriggerArea && !clickedMenu) {
                    setIsOpen(false);
                    setQuery('');
                }
            };

            document.addEventListener('mousedown', handleOutsideClick);
            return () => document.removeEventListener('mousedown', handleOutsideClick);
        }, [isOpen]);

        // Calculate dropdown positioning and height based on available space
        const calculateDropdownLayout = React.useCallback(() => {
            if (!triggerRef.current) return null;

            const viewportMargin = 8;
            const dropdownOffset = 4;
            const minListHeight = 100;
            const preferredListHeight = 200;
            const menuChromeHeight = 64;
            const rect = triggerRef.current.getBoundingClientRect();

            // Find the dialog/modal container bounds
            // This constrains the dropdown to fit within the dialog, not the full viewport
            let dialogBounds = {
                top: 0,
                bottom: window.innerHeight,
            };

            // Try to find a dialog/modal ancestor
            let ancestor: HTMLElement | null = triggerRef.current.parentElement;
            while (ancestor) {
                const role = ancestor.getAttribute('role');
                const ariaModal = ancestor.getAttribute('aria-modal');
                const dataRole = ancestor.getAttribute('data-radix-dialog-content');

                // Check if this is a dialog container
                if (role === 'dialog' || ariaModal === 'true' || dataRole) {
                    const ancestorRect = ancestor.getBoundingClientRect();
                    dialogBounds = {
                        top: ancestorRect.top + viewportMargin,
                        bottom: ancestorRect.bottom - viewportMargin,
                    };
                    break;
                }

                ancestor = ancestor.parentElement;
            }

            // Calculate available space relative to the dialog bounds
            const spaceBelow = dialogBounds.bottom - rect.bottom - dropdownOffset;
            const spaceAbove = rect.top - dialogBounds.top - dropdownOffset;

            // Determine opening direction: prefer down unless insufficient space and up is better
            const shouldOpenUpward = spaceBelow < minListHeight && spaceAbove > spaceBelow;
            const availableSpace = Math.max(shouldOpenUpward ? spaceAbove : spaceBelow, minListHeight);

            // Calculate the list height that fits in available space
            const nextListMaxHeight = Math.min(
                preferredListHeight,
                Math.max(minListHeight, availableSpace - menuChromeHeight)
            );
            const estimatedMenuHeight = nextListMaxHeight + menuChromeHeight;

            // Calculate position for portal rendering
            const rawTop = shouldOpenUpward
                ? rect.top - dropdownOffset - estimatedMenuHeight
                : rect.bottom + dropdownOffset;

            // Constrain to dialog bounds instead of viewport bounds
            const constrainedTop = Math.min(
                Math.max(rawTop, dialogBounds.top),
                dialogBounds.bottom - estimatedMenuHeight
            );

            return {
                placement: shouldOpenUpward ? 'top' : 'bottom',
                listMaxHeight: nextListMaxHeight,
                portalTop: constrainedTop,
                portalLeft: rect.left,
                portalWidth: rect.width,
            };
        }, []);

        // Calculate and apply dropdown layout immediately when opening
        React.useEffect(() => {
            if (!isOpen) return;

            // Use requestAnimationFrame to ensure DOM has painted before measuring
            // This is critical for accurate getBoundingClientRect() values
            // especially when the dropdown opens inside a newly-rendered dialog
            const frameId = requestAnimationFrame(() => {
                const layout = calculateDropdownLayout();
                if (!layout) return;

                // Update placement and height for both portal and non-portal rendering
                setMenuPlacement(layout.placement as 'top' | 'bottom');
                setListMaxHeight(layout.listMaxHeight);

                // Update portal position if using portal
                if (usePortal) {
                    setPortalPosition({
                        top: layout.portalTop,
                        left: layout.portalLeft,
                        width: layout.portalWidth,
                    });
                }
            });

            return () => cancelAnimationFrame(frameId);
        }, [isOpen, calculateDropdownLayout, usePortal]);

        React.useEffect(() => {
            if (!isOpen) return;
            searchInputRef.current?.focus();

            const selectedIndex = filteredOptions.findIndex((option) => option.value === value && !option.disabled);
            if (selectedIndex >= 0) {
                setHighlightedIndex(selectedIndex);
                return;
            }

            const firstEnabledIndex = filteredOptions.findIndex((option) => !option.disabled);
            setHighlightedIndex(firstEnabledIndex >= 0 ? firstEnabledIndex : 0);
        }, [isOpen, filteredOptions, value]);

        React.useEffect(() => {
            if (!isOpen || !listRef.current) return;
            const element = listRef.current.querySelector<HTMLElement>(`[data-option-index="${highlightedIndex}"]`);
            element?.scrollIntoView({block: 'nearest'});
        }, [highlightedIndex, isOpen]);

        // Update portal position and state based on calculated layout
        const updatePortalPosition = React.useCallback(() => {
            const layout = calculateDropdownLayout();
            if (!layout) return;

            setMenuPlacement(layout.placement as 'top' | 'bottom');
            setListMaxHeight(layout.listMaxHeight);
            setPortalPosition({
                top: layout.portalTop,
                left: layout.portalLeft,
                width: layout.portalWidth,
            });
        }, [calculateDropdownLayout]);

        const listMaxHeightStyle = `${listMaxHeight}px`;

        React.useEffect(() => {
            if (!isOpen || !usePortal || !triggerRef.current || typeof ResizeObserver === 'undefined') return;

            const observer = new ResizeObserver(() => updatePortalPosition());
            observer.observe(triggerRef.current);

            return () => observer.disconnect();
        }, [isOpen, updatePortalPosition, usePortal]);

        React.useEffect(() => {
            if (!isOpen || !usePortal) return;

            updatePortalPosition();
            const handleScrollOrResize = () => updatePortalPosition();

            window.addEventListener('resize', handleScrollOrResize);
            document.addEventListener('scroll', handleScrollOrResize, true);

            // Also listen for visibility changes (dialog open/close, tab switching, etc.)
            document.addEventListener('visibilitychange', handleScrollOrResize);

            return () => {
                window.removeEventListener('resize', handleScrollOrResize);
                document.removeEventListener('scroll', handleScrollOrResize, true);
                document.removeEventListener('visibilitychange', handleScrollOrResize);
            };
        }, [isOpen, updatePortalPosition, usePortal]);

        // Watch for layout changes in parent containers (dialog open/close, layout shifts)
        React.useEffect(() => {
            if (!isOpen || !containerRef.current) return;

            // Use MutationObserver to detect when parent dialog or layout changes
            // This ensures dropdown recalculates when dialog opens/closes
            const observer = new MutationObserver(() => {
                // Debounce to avoid too many recalculations
                requestAnimationFrame(() => {
                    updatePortalPosition();
                });
            });

            // Observe the trigger button and its ancestors for visibility/size changes
            const observeTarget = containerRef.current;
            observer.observe(observeTarget, {
                attributes: true,
                attributeFilter: ['style', 'class'],
                subtree: false,
            });

            // Also watch for changes in parent containers up the tree
            let parent = observeTarget.parentElement;
            let depth = 0;
            while (parent && depth < 5) {
                observer.observe(parent, {
                    attributes: true,
                    attributeFilter: ['style', 'class'],
                    childList: false,
                });
                parent = parent.parentElement;
                depth += 1;
            }

            return () => observer.disconnect();
        }, [isOpen, updatePortalPosition]);

        const closeMenu = React.useCallback((shouldRestoreFocus = false) => {
            setIsOpen(false);
            setQuery('');
            if (shouldRestoreFocus) {
                requestAnimationFrame(() => triggerRef.current?.focus());
            }
        }, []);

        const selectOption = React.useCallback(
            (option: SearchableSelectOption) => {
                if (option.disabled) return;
                onChange?.(option.value);
                closeMenu(true);
            },
            [closeMenu, onChange]
        );

        const getNextEnabledIndex = React.useCallback(
            (start: number, direction: 1 | -1) => {
                if (filteredOptions.length === 0) return -1;

                let index = start;
                for (let step = 0; step < filteredOptions.length; step += 1) {
                    index = (index + direction + filteredOptions.length) % filteredOptions.length;
                    if (!filteredOptions[index]?.disabled) {
                        return index;
                    }
                }

                return -1;
            },
            [filteredOptions]
        );

        const openFromKeyboard = React.useCallback(() => {
            if (disabled) return;
            setIsOpen(true);
        }, [disabled]);

        const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFromKeyboard();
            }
        };

        const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                closeMenu(true);
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                const next = getNextEnabledIndex(highlightedIndex, 1);
                if (next >= 0) setHighlightedIndex(next);
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                const next = getNextEnabledIndex(highlightedIndex, -1);
                if (next >= 0) setHighlightedIndex(next);
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                const highlighted = filteredOptions[highlightedIndex];
                if (highlighted) selectOption(highlighted);
            }
        };

        const handleWheelCapture = (event: React.WheelEvent<HTMLDivElement>) => {
            const node = event.currentTarget;
            const canScroll = node.scrollHeight > node.clientHeight;
            if (!canScroll) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            const deltaY = event.deltaY;
            const atTop = node.scrollTop <= 0;
            const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;

            if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
                event.preventDefault();
            }

            event.stopPropagation();
        };

        return (
            <div
                className={cn('relative', className)}
                ref={(node) => {
                    containerRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) ref.current = node;
                }}
            >
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen((prev) => !prev)}
                    onKeyDown={handleTriggerKeyDown}
                    ref={triggerRef}
                    className={cn(
                        'flex h-10 w-full items-center justify-between rounded-md border-2 border-admin-border bg-admin-panel px-3 py-2 text-sm text-admin-text transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-admin-bg',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-admin-bg'
                    )}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className={cn('truncate', !selectedOption && 'text-admin-text-muted')}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <span className="ml-2 flex items-center gap-1">
                        {selectedOption && !disabled && (
                            <span
                                role="button"
                                aria-label={clearAriaLabel}
                                tabIndex={0}
                                className="rounded p-0.5 text-admin-text-muted hover:text-admin-text hover:bg-admin-sidebar-hover"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onChange?.('');
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onChange?.('');
                                    }
                                }}
                            >
                                <X className="h-3.5 w-3.5"/>
                            </span>
                        )}
                        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')}/>
                    </span>
                </button>

                {isOpen &&
                    (usePortal && typeof document !== 'undefined'
                        ? createPortal(
                            <div
                                ref={menuRef}
                                className="z-100 rounded-md border border-admin-border bg-admin-panel p-2 shadow-md"
                                style={{
                                    position: 'fixed',
                                    top: portalPosition.top,
                                    left: portalPosition.left,
                                    width: portalPosition.width,
                                    maxHeight: `${listMaxHeight + 64}px`,
                                    zIndex: menuZIndex,
                                    overflow: 'hidden',
                                }}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <div
                                    className="mb-2 flex items-center gap-2 rounded-md border border-admin-border bg-admin-bg px-2 text-admin-text-muted">
                                    <Search className="h-4 w-4"/>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        onKeyDown={handleMenuKeyDown}
                                        placeholder={searchPlaceholder}
                                        className="h-9 w-full bg-transparent text-sm text-admin-text outline-none placeholder:text-admin-text-muted"
                                    />
                                </div>

                                <div
                                    ref={listRef}
                                    className="overflow-y-auto overscroll-contain rounded-md border border-admin-border/70"
                                    style={{maxHeight: listMaxHeightStyle}}
                                    onWheelCapture={handleWheelCapture}
                                >
                                    {filteredOptions.length === 0 ? (
                                        <div
                                            className="px-3 py-6 text-center text-sm text-admin-text-muted">{emptyText}</div>
                                    ) : (
                                        <ul role="listbox" className="py-1">
                                            {filteredOptions.map((option, index) => {
                                                const isSelected = option.value === value;
                                                const isHighlighted = index === highlightedIndex;

                                                return (
                                                    <li
                                                        key={option.value}
                                                        role="option"
                                                        aria-selected={isSelected}
                                                        data-option-index={index}
                                                        className={cn(
                                                            'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                                                            option.disabled
                                                                ? 'cursor-not-allowed text-admin-text-muted opacity-60'
                                                                : 'text-admin-text',
                                                            isHighlighted && !option.disabled && 'bg-admin-sidebar-hover',
                                                            isSelected && 'bg-primary-subtle text-primary font-medium'
                                                        )}
                                                        onMouseEnter={() => setHighlightedIndex(index)}
                                                        onClick={() => selectOption(option)}
                                                    >
                                                        <span className="truncate">{option.label}</span>
                                                        {isSelected && <Check className="ml-2 h-4 w-4 shrink-0"/>}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>,
                            portalTarget ?? detectedPortalTarget ?? document.body
                        )
                        : (
                            <div
                                ref={menuRef}
                                className={cn(
                                    'absolute z-100 w-full rounded-md border border-admin-border bg-admin-panel p-2 shadow-md',
                                    menuPlacement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                                )}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <div
                                    className="mb-2 flex items-center gap-2 rounded-md border border-admin-border bg-admin-bg px-2 text-admin-text-muted">
                                    <Search className="h-4 w-4"/>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        onKeyDown={handleMenuKeyDown}
                                        placeholder={searchPlaceholder}
                                        className="h-9 w-full bg-transparent text-sm text-admin-text outline-none placeholder:text-admin-text-muted"
                                    />
                                </div>

                                <div
                                    ref={listRef}
                                    className="overflow-y-auto overscroll-contain rounded-md border border-admin-border/70"
                                    style={{maxHeight: listMaxHeightStyle}}
                                    onWheelCapture={handleWheelCapture}
                                >
                                    {filteredOptions.length === 0 ? (
                                        <div
                                            className="px-3 py-6 text-center text-sm text-admin-text-muted">{emptyText}</div>
                                    ) : (
                                        <ul role="listbox" className="py-1">
                                            {filteredOptions.map((option, index) => {
                                                const isSelected = option.value === value;
                                                const isHighlighted = index === highlightedIndex;

                                                return (
                                                    <li
                                                        key={option.value}
                                                        role="option"
                                                        aria-selected={isSelected}
                                                        data-option-index={index}
                                                        className={cn(
                                                            'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                                                            option.disabled
                                                                ? 'cursor-not-allowed text-admin-text-muted opacity-60'
                                                                : 'text-admin-text',
                                                            isHighlighted && !option.disabled && 'bg-admin-sidebar-hover',
                                                            isSelected && 'bg-primary-subtle text-primary font-medium'
                                                        )}
                                                        onMouseEnter={() => setHighlightedIndex(index)}
                                                        onClick={() => selectOption(option)}
                                                    >
                                                        <span className="truncate">{option.label}</span>
                                                        {isSelected && <Check className="ml-2 h-4 w-4 shrink-0"/>}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
            </div>
        );
    }
);

SearchableSelect.displayName = 'SearchableSelect';


