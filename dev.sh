#!/bin/bash

yarn remove @ournet/domain
yarn remove @ournet/horoscopes-domain
yarn remove @ournet/horoscopes-data

yarn link @ournet/domain
yarn link @ournet/horoscopes-domain
yarn link @ournet/horoscopes-data

yarn test
