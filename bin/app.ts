#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ReproStack } from '../lib/repro-stack';

const app = new cdk.App();

new ReproStack(app, 'ReproStack');
