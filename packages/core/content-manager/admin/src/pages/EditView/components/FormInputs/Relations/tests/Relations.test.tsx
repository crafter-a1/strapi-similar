import { Form } from '@strapi/admin/strapi-admin';
import { RenderOptions, fireEvent, render as renderRTL, screen } from '@tests/utils';
import { Route, Routes } from 'react-router-dom';

import { DocumentContextProvider } from '../../../../../../features/DocumentContext';
import { RelationsInput, RelationsFieldProps } from '../Relations';

export const relationContext = {
  initialDocument: {
    documentId: 'abcdefg',
    model: 'api::test.test',
    collectionType: 'collection-types',
  },
  setCurrentDocument: jest.fn(),
};

jest.mock('../../../../../../hooks/useDocument', () => ({
  useDoc: jest.fn(() => ({})),
  useDocument: jest.fn(() => ({
    isLoading: false,
    components: {},
    document: {
      category: {
        count: 1,
      },
      createdAt: '2025-02-10T09:44:42.354Z',
      createdBy: {
        firstname: 'John',
        id: '1',
        lastname: 'Doe',
        username: 'johndoe',
      },
      documentId: 'abcdefg',
      id: 1,
      locale: null,
      name: 'test',
      updatedAt: '2025-02-10T09:44:42.354Z',
      updatedBy: {
        firstname: 'John',
        id: '1',
        lastname: 'Doe',
        username: 'johndoe',
      },
    },
    getTitle: jest.fn().mockReturnValue('Test'),
    getInitialFormValues: jest.fn().mockReturnValue({
      name: 'test',
      category: {
        connect: [],
        disconnect: [],
      },
    }),
    meta: {
      availableLocales: [],
      availableStatus: [],
    },
    schema: {
      options: {
        draftAndPublish: false,
      },
    },
  })),
}));

jest.mock('../../../../../../hooks/useDocumentLayout', () => ({
  useDocLayout: jest.fn(() => ({
    edit: {
      components: {},
    },
  })),
  useDocumentLayout: jest.fn().mockReturnValue({
    edit: {
      components: {},
      layout: [
        [
          [
            {
              attribute: { pluginOptions: {}, type: 'string' },
              disabled: false,
              hint: '',
              label: 'name',
              name: 'name',
              mainField: undefined,
              placeholder: '',
              required: false,
              type: 'string',
              unique: false,
              visible: true,
              size: 6,
            },
            {
              attribute: {
                relation: 'oneToOne',
                relationType: 'oneToOne',
                target: 'api::category.category',
                targetModel: 'api::category.category',
                type: 'relation',
              },
              disabled: false,
              hint: '',
              label: 'category',
              mainField: {
                name: 'name',
                type: 'string',
              },
              name: 'category',
              required: false,
              size: 6,
              type: 'relation',
              visible: true,
              unique: false,
            },
          ],
        ],
      ],
      settings: {
        mainField: 'name',
      },
    },
    error: false,
    isLoading: false,
    list: {
      layout: [
        {
          attribute: {
            type: 'integer',
          },
          label: 'id',
          name: 'id',
          searchable: true,
          sortable: true,
        },
        {
          attribute: {
            pluginOptions: {},
            type: 'string',
          },
          label: 'name',
          name: 'name',
          searchable: true,
          sortable: true,
        },
        {
          attribute: {
            relation: 'oneToOne',
            relationType: 'oneToOne',
            target: 'api::category.category',
            targetModel: 'api::category.category',
            type: 'relation',
          },
          label: 'category',
          name: 'category',
          mainField: {
            name: 'name',
            type: 'string',
          },
          searchable: true,
          sortable: true,
        },
      ],
    },
  }),
}));

jest.mock('@strapi/admin/strapi-admin', () => ({
  ...jest.requireActual('@strapi/admin/strapi-admin'),
  useRBAC: jest.fn(() => ({
    isLoading: false,
    allowedActions: { canUpdate: true, canDelete: true, canPublish: true },
  })),
}));

const render = ({
  initialEntries,
  ...props
}: Partial<RelationsFieldProps> & Pick<RenderOptions, 'initialEntries'> = {}) =>
  renderRTL(
    <RelationsInput
      attribute={{
        type: 'relation',
        relation: 'manyToMany',
        target: 'api::category.category',
        inversedBy: 'relation_locales',
        // @ts-expect-error – this is what the API returns
        targetModel: 'api::category.category',
        relationType: 'manyToMany',
      }}
      label="relations"
      mainField={{ name: 'name', type: 'string' }}
      name="relations"
      type="relation"
      {...props}
    />,
    {
      renderOptions: {
        wrapper: ({ children }) => (
          <Routes>
            <Route
              path="/content-manager/:collectionType/:slug/:id"
              element={
                <Form
                  method="PUT"
                  initialValues={{
                    relations: {
                      connect: [],
                      disconnect: [],
                    },
                  }}
                >
                  <DocumentContextProvider {...relationContext}>{children}</DocumentContextProvider>
                </Form>
              }
            />
          </Routes>
        ),
      },
      initialEntries: initialEntries ?? [
        '/content-manager/collection-types/api::address.address/12345',
      ],
    }
  );

describe('Relations', () => {
  /**
   * TODO: for some reason, we're not getting any data from MSW.
   */
  it.skip('should by default render just the combobox', async () => {
    const { user } = render({
      initialEntries: ['/content-manager/collection-types/api::address.address/create'],
    });

    expect(screen.getByLabelText('relations')).toBe(screen.getByRole('combobox'));

    await user.click(screen.getByRole('combobox'));

    expect(await screen.findAllByRole('option')).toHaveLength(3);
  });

  it('should by render the relations list when there is data from the API', async () => {
    render();

    expect(screen.getByLabelText('relations')).toBe(screen.getByRole('combobox'));
    expect(await screen.findAllByRole('listitem')).toHaveLength(3);

    expect(screen.getByLabelText('relations (3)')).toBe(screen.getByRole('combobox'));

    expect(screen.getByRole('button', { name: 'Relation entity 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Relation entity 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Relation entity 3' })).toBeInTheDocument();
  });

  it('should be disabled when the prop is passed', async () => {
    render({ disabled: true });

    expect(await screen.findAllByRole('listitem')).toHaveLength(3);

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('should render a hint when the prop is passed', async () => {
    render({ hint: 'This is a hint' });

    expect(await screen.findAllByRole('listitem')).toHaveLength(3);

    expect(screen.getByText('This is a hint')).toBeInTheDocument();
  });

  it.todo(
    'should show the load more button when the is a pageCount greater than 1 of the fetched data and fetch more data when pressed'
  );

  it.todo('should connect a relation');

  it.todo('should disconnect a relation');

  describe.skip('Accessibility', () => {
    it('should have have description text', () => {
      const { getByText } = render();

      expect(getByText('Press spacebar to grab and re-order')).toBeInTheDocument();
    });

    it('should update the live text when an item has been grabbed', async () => {
      const { getByText, getAllByText } = render();

      const [draggedItem] = getAllByText('Drag');

      fireEvent.keyDown(draggedItem, { key: ' ', code: 'Space' });

      expect(
        getByText(/Press up and down arrow to change position, Spacebar to drop, Escape to cancel/)
      ).toBeInTheDocument();
    });

    it('should change the live text when an item has been moved', () => {
      const { getByText, getAllByText } = render();

      const [draggedItem] = getAllByText('Drag');

      fireEvent.keyDown(draggedItem, { key: ' ', code: 'Space' });
      fireEvent.keyDown(draggedItem, { key: 'ArrowDown', code: 'ArrowDown' });

      expect(getByText(/New position in list/)).toBeInTheDocument();
    });

    it('should change the live text when an item has been dropped', () => {
      const { getByText, getAllByText } = render();

      const [draggedItem] = getAllByText('Drag');

      fireEvent.keyDown(draggedItem, { key: ' ', code: 'Space' });
      fireEvent.keyDown(draggedItem, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(draggedItem, { key: ' ', code: 'Space' });

      expect(getByText(/Final position in list/)).toBeInTheDocument();
    });

    it('should change the live text after the reordering interaction has been cancelled', () => {
      const { getAllByText, getByText } = render();

      const [draggedItem] = getAllByText('Drag');

      fireEvent.keyDown(draggedItem, { key: ' ', code: 'Space' });
      fireEvent.keyDown(draggedItem, { key: 'Escape', code: 'Escape' });

      expect(getByText(/Re-order cancelled/)).toBeInTheDocument();
    });
  });
});
