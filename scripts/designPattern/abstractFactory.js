class CPU {
	showInfo() {
		throw new Error('This method should be overridden')
	}
}

class AMDCPU extends CPU {
	showInfo() {
		console.log('AMD Ryzen 9 7950X3D')
	}
}

class NVIDIACPU extends CPU {
	showInfo() {
		console.log('NVIDIA Grace CPU Superchip')
	}
}

class GPU {
	displayInfo() {
		throw new Error('This method should be overridden')
	}
}

class AMDGPU extends GPU {
	displayInfo() {
		console.log('AMD Radeon RX 7900 XTX')
	}
}

class NVIDIAGPU extends GPU {
	displayInfo() {
		console.log('NVIDIA GeForce RTX 4090')
	}
}

class ComponentFactory {
	createCPU() {
		throw new Error('This method should be overridden')
	}
	createGPU() {
		throw new Error('This method should be overridden')
	}
}

class AMDComponentFactory extends ComponentFactory {
	createCPU() {
		return new AMDCPU()
	}
	createGPU() {
		return new AMDGPU()
	}
}

class NVIDIAComponentFactory extends ComponentFactory {
	createCPU() {
		return new NVIDIACPU()
	}
	createGPU() {
		return new NVIDIAGPU()
	}
}

function processOrders(orders) {
	orders.forEach((componentType) => {
		let factory
		if (componentType.toLowerCase() === 'amd') {
			factory = new AMDComponentFactory()
		} else if (componentType.toLowerCase() === 'nvidia') {
			factory = new NVIDIAComponentFactory()
		}

		if (factory) {
			const cpu = factory.createCPU()
			const gpu = factory.createGPU()

			cpu.showInfo()
			gpu.displayInfo()
		} else {
			console.log('Unknown component type:', componentType)
		}
	})
}

const orders = ['amd', 'nvidia']
processOrders(orders)
