// store.ts

import {createStore, AnyAction, Store, applyMiddleware } from 'redux';
import {createWrapper, Context, HYDRATE} from 'next-redux-wrapper';
import { Action, ThunkAction } from '@reduxjs/toolkit';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import type { WithSitePage, WithSitePost, } from "@/types";
import type { Site } from "@prisma/client";

export interface State {
  site: Site|null;
  page: WithSitePage|null;
  post: WithSitePost|null;
}

// create your reducer
const reducer = (state: State = {site: null, page: null,post: null}, action: AnyAction) => {
  switch (action.type) {
    case HYDRATE:
      if (action.payload.site === null) delete action.payload.site;
      if (action.payload.page === null) delete action.payload.page;
      if (action.payload.post === null) delete action.payload.post;
      // Attention! This will overwrite client state! Real apps should use proper reconciliation.
      return {...state, ...action.payload};
    case 'SITE':
      return {...state, site: action.payload};
    case 'PAGE':
      return {...state, page: action.payload};
    case 'POST':
      return {...state, post: action.payload};
    default:
      return state;
  }
};

// // create a makeStore function
// const makeStore = (context: Context) => createStore(reducer);
export const makeStore = (ontext: Context) => {
  return createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));
};


// export type AppStore = ReturnType<typeof makeStore>;
// export type AppState = ReturnType<AppStore['getState']>;
// export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;

// export an assembled wrapper
export const wrapper = createWrapper<Store<State>>(makeStore, {debug: true});
