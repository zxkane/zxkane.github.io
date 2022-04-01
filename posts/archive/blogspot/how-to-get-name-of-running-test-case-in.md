---
title: 'How to get the name of running test case in JUnit4'
date: 2010-01-11T14:57:00.001+08:00
draft: false
---

    public class NameRuleTest {      @Rule public TestName name = new TestName();          @Test public void testA() {                  assertEquals("testA", name.getMethodName());          }        @Test public void testB() {                  assertEquals("testB", name.getMethodName());          }}