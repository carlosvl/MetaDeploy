// @flow

import { createSelector } from 'reselect';

import type { AppState } from 'store';
import type { InitialProps } from 'components/utils';
import type {
  Product as ProductType,
  Products as ProductsType,
  Version as VersionType,
} from 'store/products/reducer';

export type ProductsMapType = Map<string, Array<ProductType>>;

export type VersionPlanType = {
  +label: string | null,
  +slug: string | null,
};

const selectProductsState = (appState: AppState): ProductsType =>
  appState.products;

const selectProductsByCategory: AppState => ProductsMapType = createSelector(
  selectProductsState,
  (products: ProductsType): ProductsMapType => {
    const productsByCategory = new Map();
    for (const product of products) {
      if (
        product.is_allowed &&
        product.is_listed &&
        product.most_recent_version
      ) {
        const category = product.category;
        const existing = productsByCategory.get(category) || [];
        existing.push(product);
        productsByCategory.set(category, existing);
      }
    }
    return productsByCategory;
  },
);

const selectProductCategories: AppState => Array<string> = createSelector(
  selectProductsByCategory,
  (productsByCategory: ProductsMapType): Array<string> => [
    ...productsByCategory.keys(),
  ],
);

const selectProduct = (
  appState: AppState,
  { match: { params } }: InitialProps,
): ProductType | null => {
  const product = appState.products.find(p => p.slug === params.productSlug);
  return product || null;
};

const selectVersionLabel = (
  appState: AppState,
  { match: { params } }: InitialProps,
): ?string => params.versionLabel;

const selectVersion: (
  AppState,
  InitialProps,
) => VersionType | null = createSelector(
  [selectProduct, selectVersionLabel],
  (product: ProductType | null, versionLabel: ?string): VersionType | null => {
    if (!product || !versionLabel) {
      return null;
    }
    if (
      product.most_recent_version &&
      product.most_recent_version.label === versionLabel
    ) {
      return product.most_recent_version;
    }
    if (product.versions && product.versions[versionLabel]) {
      return product.versions[versionLabel];
    }
    return null;
  },
);

const selectVersionLabelOrPlanSlug: (
  AppState,
  InitialProps,
) => VersionPlanType = createSelector(
  [selectProduct, selectVersionLabel],
  (
    product: ProductType | null,
    maybeVersionLabel: ?string,
  ): VersionPlanType => {
    // There's a chance that the versionLabel is really a planSlug.
    // In that case, check the most recent version in the product and see.
    if (!product || !maybeVersionLabel) {
      return { label: null, slug: null };
    }
    const version = product.most_recent_version;
    if (version) {
      const slugs = version.additional_plans.map(plan => plan.slug);
      if (version.primary_plan) {
        slugs.push(version.primary_plan.slug);
      }
      if (version.secondary_plan) {
        slugs.push(version.secondary_plan.slug);
      }
      if (slugs.includes(maybeVersionLabel)) {
        return {
          label: version.label,
          slug: maybeVersionLabel,
        };
      }
    }
    return {
      label: maybeVersionLabel,
      slug: null,
    };
  },
);

export {
  selectProductsState,
  selectProductsByCategory,
  selectProductCategories,
  selectProduct,
  selectVersionLabel,
  selectVersion,
  selectVersionLabelOrPlanSlug,
};
