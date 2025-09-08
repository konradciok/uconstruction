'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import styles from './filter-dropdown.module.css'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  multiple?: boolean
}

export function FilterDropdown({
  label,
  options,
  selectedValues,
  onSelectionChange,
  multiple = true
}: FilterDropdownProps) {
  const handleOptionClick = (value: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value]
      onSelectionChange(newValues)
    } else {
      onSelectionChange(selectedValues.includes(value) ? [] : [value])
    }
  }

  const selectedLabels = options
    .filter(option => selectedValues.includes(option.value))
    .map(option => option.label)

  return (
    <Menu as="div" className={styles.container}>
      <div>
        <Menu.Button className={styles.button}>
          {label}
          {selectedValues.length > 0 && (
            <span className={styles.badge}>
              {selectedValues.length}
            </span>
          )}
          <ChevronDownIcon className={styles.chevronIcon} aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={styles.menuItems}>
          <div className={styles.menuContent}>
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => handleOptionClick(option.value)}
                    className={clsx(styles.menuItemButton, {
                      [styles.menuItemButtonInactive]: !active
                    })}
                  >
                    <div className={styles.menuItemContent}>
                      <input
                        type={multiple ? 'checkbox' : 'radio'}
                        checked={selectedValues.includes(option.value)}
                        onChange={() => {}} // Handled by button click
                        className={styles.checkbox}
                      />
                      <span className={styles.optionLabel}>{option.label}</span>
                      {option.count !== undefined && (
                        <span className={styles.optionCount}>
                          ({option.count})
                        </span>
                      )}
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
