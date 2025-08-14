class Subject {
    constructor() {
        this.observers = [];
    }

    // 添加觀察者
    addObserver(observer) {
        if (typeof observer.update === 'function') {
            this.observers.push(observer);
        } else {
            console.error('Observer must have an update method');
        }
    }

    // 移除觀察者
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    // 通知所有觀察者
    notify(data) {
        this.observers.forEach(observer => observer.update(data));
    }

    // 模擬狀態變化
    changeState(newState) {
        console.log(`Subject state changed to: ${newState}`);
        this.notify(newState);
    }
}

class Observer {
    constructor(name) {
        this.name = name;
    }

    // 觀察者接收通知後的行為
    update(data) {
        console.log(`${this.name} received update: ${data}`);
    }
}

// 使用範例
const subject = new Subject();

// 創建觀察者
const observer1 = new Observer('Observer 1');
const observer2 = new Observer('Observer 2');

// 訂閱主體
subject.addObserver(observer1);
subject.addObserver(observer2);

// 改變主體狀態，觸發通知
subject.changeState('State A');

// 移除一個觀察者
subject.removeObserver(observer1);

// 再次改變狀態，只有 observer2 會收到通知
subject.changeState('State B');