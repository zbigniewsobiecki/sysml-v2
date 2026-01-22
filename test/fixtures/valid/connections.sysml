/**
 * Connections test fixture
 * Demonstrates connectors, flows, and interfaces
 */
package Connections {
    // Port definitions
    port def DataPort;
    port def ControlPort;
    port def BidirectionalPort;

    // Connection definitions
    connection def DataLink {
        end part source;
        end part target;
    }

    // Flow definition
    flow def DataFlow {
        end part producer;
        end part consumer;
    }

    // Interface definition
    interface def ServiceInterface {
        in port request;
        out port response;
    }

    // Component definitions
    part def Producer {
        out port output : DataPort;
    }

    part def Consumer {
        in port input : DataPort;
    }

    part def Controller {
        in port sensorData : DataPort;
        out port commands : ControlPort;
    }

    // System with connections
    part def System {
        part producer : Producer;
        part consumer : Consumer;
        part controller : Controller;

        // Simple connector
        connector link from producer.output to consumer.input;

        // Flow connection
        flow dataFlow of Data from producer.output to consumer.input;

        // Binding
        binding of producer.output = consumer.input;

        // Interface connection
        interface api connect producer to consumer;
    }

    // Allocation
    part def Logical;
    part def Physical;

    part def AllocatedSystem {
        part logical : Logical;
        part physical : Physical;

        allocate logical to physical;
    }

    // Data type for flow
    item def Data;
}
