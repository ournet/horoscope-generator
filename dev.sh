#!/bin/bash

yarn remove @ournet/domain
yarn remove @ournet/horoscopes-domain
yarn remove @ournet/api-client

yarn link @ournet/domain
yarn link @ournet/horoscopes-domain
yarn link @ournet/api-client

yarn test
